import { describe, expect, it } from 'vitest';
import type { DailyStat } from '@/entities/stats';
import { aggregatePulse, peakDay } from './aggregate-pulse';

const row = (date: string, email: string, commits: number, addedLines = 0): DailyStat =>
  ({
    id: 1,
    email,
    date,
    repo: 'xrg-core',
    commits,
    mergeCommits: 0,
    addedLines,
    deletedLines: 0,
    testAddedLines: 0,
    lastUpdated: `${date}T10:00:00`,
  }) as DailyStat;

describe('aggregatePulse', () => {
  it('схлопывает строки одного дня: коммиты суммируются, авторы уникальны', () => {
    const points = aggregatePulse([
      row('2026-05-02', 'a@x5.ru', 3, 100),
      row('2026-05-02', 'a@x5.ru', 2, 50), // тот же автор, другой репо
      row('2026-05-02', 'b@x5.ru', 1, 10),
    ]);

    expect(points).toHaveLength(1);
    expect(points[0]?.commits).toBe(6);
    expect(points[0]?.addedLines).toBe(160);
    expect(points[0]?.authors).toBe(2);
  });

  it('email считает регистронезависимо (один автор, не два)', () => {
    const points = aggregatePulse([row('2026-05-02', 'A@x5.ru', 1), row('2026-05-02', 'a@x5.ru', 1)]);
    expect(points[0]?.authors).toBe(1);
  });

  it('сортирует дни по возрастанию даты', () => {
    const points = aggregatePulse([
      row('2026-05-05', 'a@x5.ru', 1),
      row('2026-05-01', 'a@x5.ru', 1),
      row('2026-05-03', 'a@x5.ru', 1),
    ]);
    expect(points.map((p) => p.date)).toEqual(['2026-05-01', '2026-05-03', '2026-05-05']);
  });

  it('пустой вход → пустой ряд', () => {
    expect(aggregatePulse([])).toEqual([]);
  });
});

describe('peakDay', () => {
  it('возвращает день с максимумом коммитов', () => {
    const points = aggregatePulse([
      row('2026-05-01', 'a@x5.ru', 2),
      row('2026-05-02', 'a@x5.ru', 9),
      row('2026-05-03', 'a@x5.ru', 4),
    ]);
    expect(peakDay(points)?.date).toBe('2026-05-02');
  });

  it('пустой ряд → null', () => {
    expect(peakDay([])).toBeNull();
  });
});
