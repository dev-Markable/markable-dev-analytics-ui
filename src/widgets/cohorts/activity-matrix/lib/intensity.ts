/**
 * Уровень интенсивности ячейки (0..4) по числу коммитов относительно максимума
 * в матрице. Лог-шкала: один «герой» с сотнями коммитов не делает всех остальных
 * бесцветными. 0 — нет активности.
 */
export function intensityLevel(commits: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (commits <= 0 || max <= 0) return 0;
  const ratio = Math.log1p(commits) / Math.log1p(max);
  return Math.min(4, Math.max(1, Math.ceil(ratio * 4))) as 1 | 2 | 3 | 4;
}
