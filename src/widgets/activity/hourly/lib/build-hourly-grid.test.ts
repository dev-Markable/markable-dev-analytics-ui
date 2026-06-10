import { describe, expect, it } from 'vitest';
import { buildHourlyGrid, intensityLevel } from './build-hourly-grid';
import type { HourlyStats } from '@/entities/stats';

const stats = (cells: HourlyStats['cells']): HourlyStats => ({
  from: '2026-05-01',
  to: '2026-05-31',
  cells,
});

describe('buildHourlyGrid', () => {
  it('null → полная пустая сетка 7×24', () => {
    const g = buildHourlyGrid(null);
    expect(g.rows).toHaveLength(7);
    expect(g.rows.every((r) => r.length === 24)).toBe(true);
    expect(g.totalCommits).toBe(0);
    expect(g.maxCommits).toBe(0);
    expect(g.peak).toBeNull();
  });

  it('размещает ячейки по (weekday, hour)', () => {
    const g = buildHourlyGrid(stats([{ weekday: 2, hour: 14, commits: 7 }]));
    expect(g.rows[2][14].commits).toBe(7);
    expect(g.rows[0][0].commits).toBe(0);
    expect(g.totalCommits).toBe(7);
    expect(g.maxCommits).toBe(7);
    expect(g.peak).toEqual({ weekday: 2, hour: 14, commits: 7 });
  });

  it('пик = ячейка с максимумом', () => {
    const g = buildHourlyGrid(
      stats([
        { weekday: 0, hour: 9, commits: 3 },
        { weekday: 4, hour: 16, commits: 12 },
        { weekday: 1, hour: 11, commits: 5 },
      ]),
    );
    expect(g.peak).toEqual({ weekday: 4, hour: 16, commits: 12 });
    expect(g.totalCommits).toBe(20);
  });

  it('addedLines опционально → 0', () => {
    const g = buildHourlyGrid(stats([{ weekday: 1, hour: 10, commits: 2 }]));
    expect(g.rows[1][10].addedLines).toBe(0);
  });

  it('игнорирует ячейки вне диапазона', () => {
    const g = buildHourlyGrid(stats([{ weekday: 9, hour: 30, commits: 5 }]));
    expect(g.totalCommits).toBe(0);
  });
});

describe('intensityLevel', () => {
  it('0 коммитов → 0', () => {
    expect(intensityLevel(0, 10)).toBe(0);
  });
  it('max = 0 → 0', () => {
    expect(intensityLevel(5, 0)).toBe(0);
  });
  it('шкала 1..4 по долям', () => {
    expect(intensityLevel(2, 10)).toBe(1); // 0.2
    expect(intensityLevel(5, 10)).toBe(2); // 0.5
    expect(intensityLevel(7, 10)).toBe(3); // 0.7
    expect(intensityLevel(10, 10)).toBe(4); // 1.0
  });
});
