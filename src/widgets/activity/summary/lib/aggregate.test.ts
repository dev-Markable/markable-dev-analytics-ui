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

describe('aggregateTotals: активные дни и выходные', () => {
  it('отделяет коммиты в выходные от рабочих дней', () => {
    // 6–7 августа 2026 — чт/пт, 8-е — суббота.
    const totals = aggregateTotals([
      makeDaily({ date: '2026-08-06', commits: 3 }),
      makeDaily({ date: '2026-08-07', commits: 2 }),
      makeDaily({ date: '2026-08-08', commits: 1 }),
    ]);

    expect(totals.activeDays).toBe(3);
    expect(totals.weekendDays).toBe(1);
  });

  it('праздник считается нерабочим наравне с выходным', () => {
    // 12 июня 2026 — День России, пятница.
    const totals = aggregateTotals([makeDaily({ date: '2026-06-12', commits: 4 })]);

    expect(totals.activeDays).toBe(1);
    expect(totals.weekendDays).toBe(1);
  });

  it('день без коммитов не считается активным', () => {
    const totals = aggregateTotals([
      makeDaily({ date: '2026-08-06', commits: 0 }),
      makeDaily({ date: '2026-08-07', commits: 2 }),
    ]);

    expect(totals.activeDays).toBe(1);
    expect(totals.weekendDays).toBe(0);
  });
});
