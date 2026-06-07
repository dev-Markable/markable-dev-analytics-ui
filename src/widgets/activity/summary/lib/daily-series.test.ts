import { describe, expect, it } from 'vitest';
import { dailySeries } from './aggregate';
import { makeDaily } from '@/shared/test/factories';

describe('dailySeries', () => {
  it('пустой → пустые ряды', () => {
    expect(dailySeries([])).toEqual({ commits: [], addedLines: [], authors: [] });
  });

  it('сортирует по дате хронологически', () => {
    const daily = [
      makeDaily({ date: '2026-05-03', commits: 3 }),
      makeDaily({ date: '2026-05-01', commits: 1 }),
      makeDaily({ date: '2026-05-02', commits: 2 }),
    ];
    expect(dailySeries(daily).commits).toEqual([1, 2, 3]);
  });

  it('суммирует commits/addedLines по дате, считает уникальных авторов', () => {
    const daily = [
      makeDaily({ date: '2026-05-01', email: 'a@x5.ru', repo: 'core', commits: 2, addedLines: 100 }),
      makeDaily({ date: '2026-05-01', email: 'a@x5.ru', repo: 'ui', commits: 3, addedLines: 50 }),
      makeDaily({ date: '2026-05-01', email: 'b@x5.ru', repo: 'core', commits: 1, addedLines: 10 }),
    ];
    const s = dailySeries(daily);
    expect(s.commits).toEqual([6]); // 2+3+1
    expect(s.addedLines).toEqual([160]); // 100+50+10
    expect(s.authors).toEqual([2]); // a, b
  });
});
