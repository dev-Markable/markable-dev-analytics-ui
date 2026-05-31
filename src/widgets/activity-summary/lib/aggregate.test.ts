import { describe, expect, it } from 'vitest';
import { aggregateTotals } from './aggregate';
import { makeDaily } from '@/shared/test/factories';

describe('aggregateTotals', () => {
  it('пустой → нули', () => {
    const t = aggregateTotals([]);
    expect(t.totalCommits).toBe(0);
    expect(t.uniqueAuthors).toBe(0);
    expect(t.uniqueRepos).toBe(0);
    expect(t.activeDays).toBe(0);
  });

  it('считает уникальных авторов/репо/дни и суммы', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', repo: 'core', date: '2026-05-01', commits: 3, addedLines: 100 }),
      makeDaily({ email: 'a@x5.ru', repo: 'ui', date: '2026-05-01', commits: 2, addedLines: 50 }),
      makeDaily({ email: 'b@x5.ru', repo: 'core', date: '2026-05-02', commits: 5, addedLines: 30 }),
    ];
    const t = aggregateTotals(daily);

    expect(t.totalCommits).toBe(10);
    expect(t.totalAddedLines).toBe(180);
    expect(t.uniqueAuthors).toBe(2); // a, b
    expect(t.uniqueRepos).toBe(2); // core, ui
    expect(t.activeDays).toBe(2); // 05-01, 05-02
  });

  it('дни с нулём коммитов не считаются активными', () => {
    const daily = [
      makeDaily({ date: '2026-05-01', commits: 0 }),
      makeDaily({ date: '2026-05-02', commits: 1 }),
    ];
    expect(aggregateTotals(daily).activeDays).toBe(1);
  });
});
