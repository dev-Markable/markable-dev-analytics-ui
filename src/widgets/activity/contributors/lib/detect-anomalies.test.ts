import { describe, expect, it } from 'vitest';
import { detectAnomaliesByAuthor } from './detect-anomalies';
import { makeDaily } from '@/shared/test/factories';

const RANGE = { from: '2026-05-01', to: '2026-05-30' };

describe('detectAnomaliesByAuthor', () => {
  it('пусто → пустая мапа', () => {
    expect(detectAnomaliesByAuthor([], RANGE).size).toBe(0);
  });

  it('STALE: последний коммит давно', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-02', commits: 3, mergeCommits: 0 }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'STALE')).toBe(true);
  });

  it('не STALE, если коммитил у конца периода', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-29', commits: 3, mergeCommits: 0 }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'STALE')).toBe(false);
  });

  it('DECLINING: вторая половина слабее первой', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-03', commits: 10, mergeCommits: 0 }),
      makeDaily({ email: 'a@x5.ru', date: '2026-05-28', commits: 1, mergeCommits: 0 }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'DECLINING')).toBe(true);
  });

  it('LOW_TESTS: много кода, мало тестов', () => {
    const daily = [
      makeDaily({
        email: 'a@x5.ru',
        date: '2026-05-28',
        commits: 5,
        mergeCommits: 0,
        addedLines: 1000,
        testAddedLines: 10,
      }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'LOW_TESTS')).toBe(true);
  });

  it('нет LOW_TESTS при достаточной доле тестов', () => {
    const daily = [
      makeDaily({
        email: 'a@x5.ru',
        date: '2026-05-28',
        commits: 5,
        mergeCommits: 0,
        addedLines: 1000,
        testAddedLines: 300,
      }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'LOW_TESTS')).toBe(false);
  });

  it('здоровый автор → не в мапе', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-15', commits: 5, mergeCommits: 0, addedLines: 100, testAddedLines: 50 }),
      makeDaily({ email: 'a@x5.ru', date: '2026-05-28', commits: 6, mergeCommits: 0, addedLines: 100, testAddedLines: 50 }),
    ];
    expect(detectAnomaliesByAuthor(daily, RANGE).has('a@x5.ru')).toBe(false);
  });

  it('merge-коммиты не считаются активностью для STALE', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-15', commits: 5, mergeCommits: 0 }),
      // только merge в конце — не сбрасывает stale
      makeDaily({ email: 'a@x5.ru', date: '2026-05-29', commits: 2, mergeCommits: 2 }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'STALE')).toBe(true);
  });
});
