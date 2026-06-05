import type { AuthorActivity } from '@/entities/user';
import type { WeeklyStat } from '../model/types';

/**
 * Пересчитывает per-week totals из отфильтрованного набора авторов.
 * Предикат передаётся снаружи — например, фильтр по полю `team` автора
 * (для глобального скопа команды) или по любому другому полю.
 *
 * Возвращает новый массив объектов недели с пересчитанными `total*`.
 */
export function applyTeamFilterToWeekly(
  weeks: readonly WeeklyStat[],
  accept: (author: AuthorActivity) => boolean,
): WeeklyStat[] {
  return weeks.map((w) => {
    const filtered = w.authors.filter(accept);
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
