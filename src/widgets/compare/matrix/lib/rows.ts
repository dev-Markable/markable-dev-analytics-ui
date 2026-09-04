import type { AuthorActivity } from '@/entities/user';
import { formatNumber, formatPercent, safeDiv } from '@/shared/lib';

export interface CompareRow {
  key: string;
  label: string;
  hint?: string;
  /** Значение для отображения per-author. */
  display: (a: AuthorActivity) => string;
  /**
   * Числовое значение для полосы и лидера. null — метрика не ранжируется:
   * полоса не рисуется, лидер не выделяется.
   */
  raw: (a: AuthorActivity) => number | null;
}

/**
 * Строки сравнения.
 *
 * Ранжируются только те метрики, где «больше» однозначно лучше. У «удалено строк»
 * и «merge-коммитов» направления нет: чистка мёртвого кода — это хорошо, а
 * merge-коммиты вообще про воркфлоу, а не про вклад. Раньше они выводились без
 * подсветки лидера, но в остальном выглядели как полноценные участники гонки —
 * теперь у них нет и полосы, только число.
 *
 * <b>Доля тестов не ранжируется тоже.</b> Корона за 87% означала «чем больше
 * тестов, тем лучше», хотя при такой доле на продакшен-код остаётся седьмая часть
 * написанного. Разворот направления («меньше — лучше») был бы ошибкой того же
 * рода: ноль тестов не лучше 87%. Метрика с оптимумом посередине не сравнивается
 * через «кто больше» ни в одну сторону — как и строки на коммит, где плохи и
 * микро-коммиты, и полотна.
 */
export const COMPARE_ROWS: readonly CompareRow[] = [
  {
    key: 'nonMergeCommits',
    label: 'Коммиты',
    hint: 'без мерджей',
    display: (a) => formatNumber(a.nonMergeCommits),
    raw: (a) => a.nonMergeCommits,
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
    hint: 'не ранжируется — чистка кода это не хуже',
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
    hint: 'не ранжируется — плохи оба конца',
    display: (a) => formatPercent(safeDiv(a.testAddedLines, a.addedLines) * 100, 1),
    raw: () => null,
  },
  {
    key: 'linesPerCommit',
    label: 'Строк на коммит',
    hint: 'не ранжируется — плохи оба конца',
    display: (a) => formatNumber(Math.round(safeDiv(a.addedLines, a.nonMergeCommits))),
    raw: () => null,
  },
  {
    key: 'score',
    label: 'Activity score',
    hint: '1.0 ≈ норма команды',
    display: (a) => (a.activity ? a.activity.score.toFixed(2) : '—'),
    raw: (a) => a.activity?.score ?? null,
  },
  {
    key: 'mergeCommits',
    label: 'Merge-коммиты',
    hint: 'не ранжируется — про воркфлоу, а не про вклад',
    display: (a) => formatNumber(a.mergeCommits),
    raw: () => null,
  },
];

export interface CellShare {
  email: string;
  display: string;
  /** Доля от лидера строки, 0..1. null — строка не ранжируется. */
  share: number | null;
  isLeader: boolean;
}

/**
 * Значения строки по авторам с долей от лидера.
 *
 * Доля — то, чего не давал ни радар, ни голая таблица: «в полтора раза больше»
 * читается с полосы мгновенно, а из пары чисел приходится вычитать в уме.
 *
 * Лидер не выделяется при ничьей и при нулях у всех — иначе подсветка означала
 * бы победу там, где её нет.
 */
export function rowCells(row: CompareRow, authors: readonly AuthorActivity[]): CellShare[] {
  const values = authors.map((a) => row.raw(a));
  const rankable = values.every((v) => v != null);
  const max = rankable ? Math.max(...(values as number[])) : 0;
  const leaders = rankable ? (values as number[]).filter((v) => v === max).length : 0;
  const hasLeader = rankable && max > 0 && leaders === 1;

  return authors.map((a, i) => {
    const raw = values[i];
    return {
      email: a.email,
      display: row.display(a),
      share: rankable && max > 0 ? (raw as number) / max : null,
      isLeader: hasLeader && raw === max,
    };
  });
}
