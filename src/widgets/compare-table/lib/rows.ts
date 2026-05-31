import type { AuthorActivity } from '@/entities/user';
import { formatNumber, formatPercent, safeDiv } from '@/shared/lib';

export interface CompareRow {
  key: string;
  label: string;
  /** Значение для отображения per-author. */
  display: (a: AuthorActivity) => string;
  /** Числовое значение для определения лидера. null = не подсвечивать. */
  raw: (a: AuthorActivity) => number | null;
  /** true → меньше = лучше (для «удалено» лидер не выделяется зелёным). */
  lowerIsBetter?: boolean;
}

export const COMPARE_ROWS: readonly CompareRow[] = [
  {
    key: 'nonMergeCommits',
    label: 'Коммиты (не-мердж)',
    display: (a) => formatNumber(a.nonMergeCommits),
    raw: (a) => a.nonMergeCommits,
  },
  {
    key: 'commits',
    label: 'Коммиты (всего)',
    display: (a) => formatNumber(a.commits),
    raw: (a) => a.commits,
  },
  {
    key: 'mergeCommits',
    label: 'Merge-коммиты',
    display: (a) => formatNumber(a.mergeCommits),
    raw: () => null,
  },
  {
    key: 'addedLines',
    label: 'Добавлено строк',
    display: (a) => formatNumber(a.addedLines),
    raw: (a) => a.addedLines,
  },
  {
    key: 'deletedLines',
    label: 'Удалено строк',
    display: (a) => formatNumber(a.deletedLines),
    raw: () => null,
  },
  {
    key: 'testAddedLines',
    label: 'Тестовых строк',
    display: (a) => formatNumber(a.testAddedLines),
    raw: (a) => a.testAddedLines,
  },
  {
    key: 'testRatio',
    label: 'Доля тестов',
    display: (a) => formatPercent(safeDiv(a.testAddedLines, a.addedLines) * 100, 1),
    raw: (a) => safeDiv(a.testAddedLines, a.addedLines),
  },
  {
    key: 'score',
    label: 'Activity score',
    display: (a) => (a.activity ? a.activity.score.toFixed(2) : '—'),
    raw: (a) => a.activity?.score ?? null,
  },
];

/**
 * Email автора-лидера по строке (максимум `raw`). null, если строка
 * не ранжируется или все значения равны/нулевые.
 */
export function leaderEmail(
  row: CompareRow,
  authors: readonly AuthorActivity[],
): string | null {
  let best: { email: string; value: number } | null = null;
  for (const a of authors) {
    const v = row.raw(a);
    if (v == null) return null;
    if (!best || v > best.value) best = { email: a.email, value: v };
  }
  // Не подсвечиваем, если у всех 0 или ничья на нуле.
  if (!best || best.value === 0) return null;
  // Ничья: несколько авторов с тем же значением → не выделяем «лидера».
  const tie = authors.filter((a) => row.raw(a) === best!.value).length > 1;
  return tie ? null : best.email;
}
