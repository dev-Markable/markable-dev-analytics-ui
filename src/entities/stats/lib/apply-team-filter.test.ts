import { describe, expect, it } from 'vitest';
import { applyTeamFilterToWeekly } from './apply-team-filter';
import { makeWeek } from '@/shared/test/factories';
import { makeAuthor } from '@/shared/test/factories';

const team = new Set(['boris@x5.ru', 'kiril@x5.ru']);
const isMember = (email: string) => team.has(email.toLowerCase());

describe('applyTeamFilterToWeekly', () => {
  it('оставляет только авторов команды и пересчитывает totals', () => {
    const week = makeWeek({
      totalCommits: 100,
      totalAddedLines: 9999,
      authors: [
        makeAuthor({ email: 'boris@x5.ru', commits: 10, addedLines: 100, deletedLines: 20, testAddedLines: 5, mergeCommits: 1 }),
        makeAuthor({ email: 'external@gmail.com', commits: 90, addedLines: 9000 }),
        makeAuthor({ email: 'kiril@x5.ru', commits: 5, addedLines: 50, deletedLines: 10, testAddedLines: 2, mergeCommits: 0 }),
      ],
    });

    const [result] = applyTeamFilterToWeekly([week], isMember);

    expect(result.authors.map((a) => a.email)).toEqual(['boris@x5.ru', 'kiril@x5.ru']);
    expect(result.totalCommits).toBe(15);
    expect(result.totalMergeCommits).toBe(1);
    expect(result.totalAddedLines).toBe(150);
    expect(result.totalDeletedLines).toBe(30);
    expect(result.totalTestAddedLines).toBe(7);
  });

  it('неизменные метаданные недели (year/week/weekStart)', () => {
    const week = makeWeek({ year: 2026, week: 19, weekStart: '2026-05-04' });
    const [result] = applyTeamFilterToWeekly([week], isMember);
    expect(result.year).toBe(2026);
    expect(result.week).toBe(19);
    expect(result.weekStart).toBe('2026-05-04');
  });

  it('неделя без членов команды → нулевые totals и пустой authors', () => {
    const week = makeWeek({
      totalCommits: 50,
      authors: [makeAuthor({ email: 'external@gmail.com', commits: 50 })],
    });
    const [result] = applyTeamFilterToWeekly([week], isMember);
    expect(result.authors).toHaveLength(0);
    expect(result.totalCommits).toBe(0);
  });

  it('email матчится регистронезависимо', () => {
    const week = makeWeek({
      authors: [makeAuthor({ email: 'Boris@X5.ru', commits: 3 })],
    });
    const [result] = applyTeamFilterToWeekly([week], isMember);
    expect(result.authors).toHaveLength(1);
    expect(result.totalCommits).toBe(3);
  });
});
