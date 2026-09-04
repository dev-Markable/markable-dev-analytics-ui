import { describe, expect, it } from 'vitest';
import { buildProfileCodeStats } from './compare-code';
import { makeAuthor } from '@/shared/test/factories';

/** Автор с заданной долей тестов и размером коммита. */
const author = (
  email: string,
  { added, tests, commits }: { added: number; tests: number; commits: number },
) =>
  makeAuthor({
    email,
    addedLines: added,
    testAddedLines: tests,
    commits,
    mergeCommits: 0,
  });

describe('buildProfileCodeStats', () => {
  it('доля тестов выше коридора → above', () => {
    const stats = buildProfileCodeStats(
      [
        author('me@x.ru', { added: 1000, tests: 500, commits: 10 }), // 50%
        author('a@x.ru', { added: 1000, tests: 100, commits: 10 }), // 10%
        author('b@x.ru', { added: 1000, tests: 100, commits: 10 }), // 10%
      ],
      'me@x.ru',
    );

    expect(stats?.testRatio.value).toBeCloseTo(50);
    // Среднее по трём: (50 + 10 + 10) / 3 ≈ 23.3
    expect(stats?.testRatio.teamAvg).toBeCloseTo(23.33, 1);
    expect(stats?.testRatio.standing).toBe('above');
  });

  it('в пределах ±15% от среднего → around', () => {
    const stats = buildProfileCodeStats(
      [
        author('me@x.ru', { added: 1000, tests: 210, commits: 10 }), // 21%
        author('a@x.ru', { added: 1000, tests: 200, commits: 10 }), // 20%
        author('b@x.ru', { added: 1000, tests: 190, commits: 10 }), // 19%
      ],
      'me@x.ru',
    );

    expect(stats?.testRatio.standing).toBe('around');
  });

  it('среднее считается от долей, а не от сумм — один огромный автор не размывает базу', () => {
    const stats = buildProfileCodeStats(
      [
        author('me@x.ru', { added: 100, tests: 30, commits: 5 }), // 30%
        // Сгенерированный дамп: 100k строк, тестов нет. По сумме команда была бы
        // на 0.03% тестов, и любой живой автор оказался бы «выше среднего».
        author('dump@x.ru', { added: 100_000, tests: 0, commits: 1 }), // 0%
      ],
      'me@x.ru',
    );

    // Среднее долей = (30 + 0) / 2 = 15, а не 30/100100 ≈ 0.03.
    expect(stats?.testRatio.teamAvg).toBeCloseTo(15);
    expect(stats?.testRatio.standing).toBe('above');
  });

  it('база — только авторы с коммитами: молчавшие не занижают планку', () => {
    const silent = makeAuthor({
      email: 'silent@x.ru',
      addedLines: 0,
      testAddedLines: 0,
      commits: 0,
      mergeCommits: 0,
    });
    const stats = buildProfileCodeStats(
      [author('me@x.ru', { added: 1000, tests: 200, commits: 10 }), silent, silent],
      'me@x.ru',
    );

    // Если бы молчуны попали в базу, среднее упало бы до ~6.7% и 20% стало бы «above».
    expect(stats?.testRatio.teamAvg).toBeCloseTo(20);
    expect(stats?.testRatio.standing).toBe('around');
  });

  it('строк на коммит считается по не-мердж коммитам', () => {
    const me = makeAuthor({
      email: 'me@x.ru',
      addedLines: 900,
      testAddedLines: 100,
      commits: 12,
      mergeCommits: 3, // не-мердж: 9
    });
    const stats = buildProfileCodeStats([me], 'me@x.ru');

    expect(stats?.linesPerCommit.value).toBeCloseTo(100);
  });

  it('автора нет в выборке → null (плитки без бейджей, а не выдуманное сравнение)', () => {
    const others = [author('a@x.ru', { added: 1000, tests: 100, commits: 10 })];

    expect(buildProfileCodeStats(others, 'me@x.ru')).toBeNull();
    expect(buildProfileCodeStats(undefined, 'me@x.ru')).toBeNull();
    expect(buildProfileCodeStats([], 'me@x.ru')).toBeNull();
  });

  it('в выборке только автор без коммитов → null', () => {
    const idle = makeAuthor({
      email: 'me@x.ru',
      addedLines: 0,
      testAddedLines: 0,
      commits: 0,
      mergeCommits: 0,
    });

    expect(buildProfileCodeStats([idle], 'me@x.ru')).toBeNull();
  });

  it('email матчится без учёта регистра', () => {
    const stats = buildProfileCodeStats(
      [author('Me@X.ru', { added: 1000, tests: 200, commits: 10 })],
      'me@x.ru',
    );

    expect(stats).not.toBeNull();
  });
});
