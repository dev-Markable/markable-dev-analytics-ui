import { describe, expect, it } from 'vitest';
import { aggregateBusFactor } from './aggregate-bus-factor';
import { makeDaily } from '@/shared/test/factories';

describe('aggregateBusFactor', () => {
  it('пустой → пусто', () => {
    expect(aggregateBusFactor([])).toEqual([]);
  });

  it('один автор делает всё → busFactor 1, риск high', () => {
    const daily = [
      makeDaily({ repo: 'core', email: 'a@x5.ru', commits: 10, mergeCommits: 0 }),
    ];
    const [bf] = aggregateBusFactor(daily);
    expect(bf.busFactor).toBe(1);
    expect(bf.riskLevel).toBe('high');
    expect(bf.topAuthorShare).toBe(1);
    expect(bf.authorCount).toBe(1);
  });

  it('два автора 50/50 → busFactor 2, риск medium', () => {
    const daily = [
      makeDaily({ repo: 'core', email: 'a@x5.ru', commits: 5, mergeCommits: 0 }),
      makeDaily({ repo: 'core', email: 'b@x5.ru', commits: 5, mergeCommits: 0 }),
    ];
    const [bf] = aggregateBusFactor(daily);
    // топ-1 (5/10=50%) не > 50% → нужен второй
    expect(bf.busFactor).toBe(2);
    expect(bf.riskLevel).toBe('medium');
  });

  it('равномерно 4 автора → busFactor 3, риск low', () => {
    const daily = ['a', 'b', 'c', 'd'].map((e) =>
      makeDaily({ repo: 'core', email: `${e}@x5.ru`, commits: 5, mergeCommits: 0 }),
    );
    const [bf] = aggregateBusFactor(daily);
    // 25%+25%=50% не >50%, +третий 75% >50% → 3
    expect(bf.busFactor).toBe(3);
    expect(bf.riskLevel).toBe('low');
  });

  it('считает только не-мердж коммиты', () => {
    const daily = [
      makeDaily({ repo: 'core', email: 'a@x5.ru', commits: 10, mergeCommits: 4 }),
    ];
    const [bf] = aggregateBusFactor(daily);
    expect(bf.totalCommits).toBe(6); // 10-4
  });

  it('репо без не-мердж коммитов отбрасывается', () => {
    const daily = [
      makeDaily({ repo: 'merges-only', email: 'a@x5.ru', commits: 3, mergeCommits: 3 }),
    ];
    expect(aggregateBusFactor(daily)).toEqual([]);
  });

  it('сортировка: высокий риск + крупный объём сверху', () => {
    const daily = [
      // low-risk репо
      ...['a', 'b', 'c'].map((e) =>
        makeDaily({ repo: 'shared', email: `${e}@x5.ru`, commits: 10, mergeCommits: 0 }),
      ),
      // high-risk репо, один автор
      makeDaily({ repo: 'solo', email: 'x@x5.ru', commits: 50, mergeCommits: 0 }),
    ];
    const result = aggregateBusFactor(daily);
    expect(result[0].repo).toBe('solo'); // high risk первым
    expect(result[0].riskLevel).toBe('high');
  });
});
