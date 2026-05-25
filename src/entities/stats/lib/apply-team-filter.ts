import type { WeeklyStat } from '../model/types';

/**
 * Пересчитывает per-week totals из отфильтрованного по команде набора авторов.
 * Если фильтр выключен — возвращает исходный массив (без копий).
 *
 * `isMember(email)` — предикат, передаётся снаружи (из team-filter store).
 */
export function applyTeamFilterToWeekly(
  weeks: readonly WeeklyStat[],
  isMember: (email: string) => boolean,
): WeeklyStat[] {
  return weeks.map((w) => {
    const filtered = w.authors.filter((a) => isMember(a.email));
    return {
      ...w,
      authors: filtered,
      totalCommits: filtered.reduce((s, a) => s + a.commits, 0),
      totalMergeCommits: filtered.reduce((s, a) => s + a.mergeCommits, 0),
      totalAddedLines: filtered.reduce((s, a) => s + a.addedLines, 0),
      totalDeletedLines: filtered.reduce((s, a) => s + a.deletedLines, 0),
      totalTestAddedLines: filtered.reduce((s, a) => s + a.testAddedLines, 0),
    };
  });
}
