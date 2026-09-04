import { describe, expect, it } from 'vitest';
import type { DailyStat } from '@/entities/stats';
import { dayjs } from '@/shared/lib';
import { aggregatePulse, nonWorkingBands, peakDay } from './aggregate-pulse';

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

describe('aggregatePulse: достройка периода', () => {
  const day = (date: string, commits: number): DailyStat =>
    row(date, 'a@x.ru', commits, commits * 10);

  it('ряд покрывает весь период, а не только дни с данными', () => {
    // 3–9 августа 2026: пн–вс. Данные только за 3 и 5 августа.
    const points = aggregatePulse([day('2026-08-03', 4), day('2026-08-05', 6)], {
      from: '2026-08-03',
      to: '2026-08-09',
    });

    expect(points).toHaveLength(7);
    expect(points[0]?.date).toBe('2026-08-03');
    expect(points[6]?.date).toBe('2026-08-09');
  });

  it('день без коммитов — честный ноль, а не разрыв в ряду', () => {
    const points = aggregatePulse([day('2026-08-03', 4), day('2026-08-05', 6)], {
      from: '2026-08-03',
      to: '2026-08-05',
    });

    // 4 августа: раньше этой точки не было и линия рисовалась прямой 4 → 6.
    expect(points[1]).toMatchObject({ date: '2026-08-04', commits: 0, authors: 0 });
  });

  it('хвост в будущее обрезается сегодняшним днём', () => {
    const today = dayjs().startOf('day');
    const from = today.subtract(2, 'day').format('YYYY-MM-DD');
    const to = today.add(10, 'day').format('YYYY-MM-DD');

    const points = aggregatePulse([day(from, 3)], { from, to });

    expect(points).toHaveLength(3);
    expect(points.at(-1)?.date).toBe(today.format('YYYY-MM-DD'));
  });

  it('размечает выходные и праздники', () => {
    const points = aggregatePulse([], { from: '2026-08-07', to: '2026-08-09' });

    expect(points.map((p) => p.kind)).toEqual(['working', 'weekend', 'weekend']);
    // 12 июня 2026 — День России (пятница).
    expect(aggregatePulse([], { from: '2026-06-12', to: '2026-06-12' })[0]?.kind).toBe('holiday');
  });

  it('без периода поведение прежнее — только дни из выборки', () => {
    const points = aggregatePulse([day('2026-08-03', 4), day('2026-08-05', 6)]);

    expect(points.map((p) => p.date)).toEqual(['2026-08-03', '2026-08-05']);
  });
});

describe('peakDay', () => {
  it('пустые дни не становятся пиком', () => {
    const points = aggregatePulse([], { from: '2026-08-07', to: '2026-08-09' });

    expect(peakDay(points)).toBeNull();
  });
});

describe('nonWorkingBands', () => {
  it('склеивает подряд идущие нерабочие дни в одну полосу', () => {
    // 7 авг (пт) · 8–9 (сб/вс) · 10 (пн)
    const bands = nonWorkingBands(aggregatePulse([], { from: '2026-08-07', to: '2026-08-10' }));

    expect(bands).toEqual([{ from: '2026-08-08', to: '2026-08-09' }]);
  });

  it('несколько разрозненных выходных — несколько полос', () => {
    // Две прошедшие недели: 6–19 июля 2026 (пн–вс). Период в прошлом осознанно —
    // будущий хвост обрезается по сегодня и второй выходной в ряд не попал бы.
    const bands = nonWorkingBands(aggregatePulse([], { from: '2026-07-06', to: '2026-07-19' }));

    expect(bands).toEqual([
      { from: '2026-07-11', to: '2026-07-12' },
      { from: '2026-07-18', to: '2026-07-19' },
    ]);
  });

  it('период целиком в рабочих днях — полос нет', () => {
    expect(nonWorkingBands(aggregatePulse([], { from: '2026-08-03', to: '2026-08-07' }))).toEqual(
      [],
    );
  });
});
