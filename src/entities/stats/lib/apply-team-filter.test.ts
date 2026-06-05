import { describe, expect, it } from 'vitest';
import { applyTeamFilterToWeekly } from './apply-team-filter';
import { makeAuthor, makeWeek } from '@/shared/test/factories';

const inTeam = (name: string) => (author: { team?: string | null }) => author.team === name;

describe('applyTeamFilterToWeekly', () => {
  it('оставляет только авторов команды и пересчитывает totals', () => {
    const week = makeWeek({
      totalCommits: 100,
      totalAddedLines: 9999,
      authors: [
        makeAuthor({ email: 'boris@x5.ru', team: 'Маркировка', commits: 10, addedLines: 100, deletedLines: 20, testAddedLines: 5, mergeCommits: 1 }),
        makeAuthor({ email: 'external@gmail.com', team: null, commits: 90, addedLines: 9000 }),
        makeAuthor({ email: 'kiril@x5.ru', team: 'Маркировка', commits: 5, addedLines: 50, deletedLines: 10, testAddedLines: 2, mergeCommits: 0 }),
      ],
    });

    const [result] = applyTeamFilterToWeekly([week], inTeam('Маркировка'));

    expect(result.authors.map((a) => a.email)).toEqual(['boris@x5.ru', 'kiril@x5.ru']);
    expect(result.totalCommits).toBe(15);
    expect(result.totalMergeCommits).toBe(1);
    expect(result.totalAddedLines).toBe(150);
    expect(result.totalDeletedLines).toBe(30);
    expect(result.totalTestAddedLines).toBe(7);
  });

  it('неизменные метаданные недели (year/week/weekStart)', () => {
    const week = makeWeek({ year: 2026, week: 19, weekStart: '2026-05-04' });
    const [result] = applyTeamFilterToWeekly([week], inTeam('Маркировка'));
    expect(result.year).toBe(2026);
    expect(result.week).toBe(19);
    expect(result.weekStart).toBe('2026-05-04');
  });

  it('неделя без членов команды → нулевые totals и пустой authors', () => {
    const week = makeWeek({
      totalCommits: 50,
      authors: [makeAuthor({ email: 'external@gmail.com', team: null, commits: 50 })],
    });
    const [result] = applyTeamFilterToWeekly([week], inTeam('Маркировка'));
    expect(result.authors).toHaveLength(0);
    expect(result.totalCommits).toBe(0);
  });

  it('предикат «без команды» отбирает авторов с team=null', () => {
    const week = makeWeek({
      authors: [
        makeAuthor({ email: 'a@x5.ru', team: null, commits: 7 }),
        makeAuthor({ email: 'b@x5.ru', team: 'Маркировка', commits: 3 }),
      ],
    });
    const [result] = applyTeamFilterToWeekly([week], (a) => !a.team);
    expect(result.authors).toHaveLength(1);
    expect(result.totalCommits).toBe(7);
  });
});
