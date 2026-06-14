import { describe, expect, it } from 'vitest';
import type { CohortDeveloper } from '@/entities/cohort';
import { filterDevelopers, sortDevelopers, totalCommits } from './sort';
import { intensityLevel } from './intensity';

const dev = (over: Partial<CohortDeveloper>): CohortDeveloper => ({
  email: 'a@x5.ru',
  displayName: null,
  avatarUrl: null,
  team: null,
  firstActive: '2026-01',
  lastActive: '2026-06',
  cells: [],
  ...over,
});

describe('filterDevelopers', () => {
  const devs = [
    dev({ email: 'alice@x5.ru', displayName: 'Alice', team: 'Core' }),
    dev({ email: 'bob@x5.ru', displayName: 'Bob', team: 'Platform' }),
  ];
  it('пустой запрос → копия всех', () => {
    expect(filterDevelopers(devs, ' ')).toHaveLength(2);
  });
  it('ищет по имени/email/команде', () => {
    expect(filterDevelopers(devs, 'platform').map((d) => d.email)).toEqual(['bob@x5.ru']);
    expect(filterDevelopers(devs, 'alice@').map((d) => d.email)).toEqual(['alice@x5.ru']);
  });
});

describe('sortDevelopers', () => {
  it('tenure — по firstActive возрастанием', () => {
    const devs = [dev({ email: 'new@x5.ru', firstActive: '2026-05' }), dev({ email: 'old@x5.ru', firstActive: '2025-01' })];
    expect(sortDevelopers(devs, 'tenure').map((d) => d.email)).toEqual(['old@x5.ru', 'new@x5.ru']);
  });
  it('activity — по сумме коммитов убыванием', () => {
    const devs = [dev({ email: 'low@x5.ru', cells: [1, 1] }), dev({ email: 'high@x5.ru', cells: [10, 20] })];
    expect(sortDevelopers(devs, 'activity').map((d) => d.email)).toEqual(['high@x5.ru', 'low@x5.ru']);
  });
  it('team — без команды в конец', () => {
    const devs = [dev({ email: 'none@x5.ru', team: null }), dev({ email: 'core@x5.ru', team: 'Core' })];
    expect(sortDevelopers(devs, 'team').map((d) => d.email)).toEqual(['core@x5.ru', 'none@x5.ru']);
  });
});

describe('totalCommits', () => {
  it('суммирует ячейки', () => {
    expect(totalCommits(dev({ cells: [3, 0, 7] }))).toBe(10);
  });
});

describe('intensityLevel', () => {
  it('0 коммитов / нулевой max → 0', () => {
    expect(intensityLevel(0, 100)).toBe(0);
    expect(intensityLevel(5, 0)).toBe(0);
  });
  it('всегда в диапазоне 1..4 при активности', () => {
    expect(intensityLevel(1, 100)).toBeGreaterThanOrEqual(1);
    expect(intensityLevel(100, 100)).toBe(4);
  });
});
