import type { AuthorActivity } from '@/entities/user';
import { formatCompact, formatNumber } from '@/shared/lib';

/**
 * Описание метрики, по которой строится распределение. Accessor возвращает
 * null, если у автора метрики нет (напр. activity заполнен только на /dashboard,
 * а avgLinesPerCommit живёт внутри него) — такие записи отсеет computeDistribution.
 */
export interface MetricDef {
  key: string;
  /** Подпись для переключателя. */
  label: string;
  /** Расшифровка под графиком — что именно меряем. */
  hint: string;
  accessor: (a: AuthorActivity) => number | null;
  /** Форматтер значений на осях и в плитках. */
  format: (n: number) => string;
}

const roundFmt = (n: number) => formatNumber(Math.round(n));

export const DISTRIBUTION_METRICS: readonly MetricDef[] = [
  {
    key: 'score',
    label: 'Score',
    hint: 'Композитный score (volume × quality). 1.0 ≈ норма команды',
    accessor: (a) => a.activity?.score ?? null,
    format: (n) => n.toFixed(2),
  },
  {
    key: 'commits',
    label: 'Коммиты',
    hint: 'Не-мердж коммиты за период',
    accessor: (a) => a.nonMergeCommits,
    format: roundFmt,
  },
  {
    key: 'linesPerCommit',
    label: 'Строк/коммит',
    hint: 'Средний размер коммита — мелкие и «бомбы» одинаково видны',
    accessor: (a) => a.activity?.avgLinesPerCommit ?? null,
    format: roundFmt,
  },
  {
    key: 'addedLines',
    label: 'Добавлено',
    hint: 'Объём добавленного кода за период',
    accessor: (a) => a.addedLines,
    format: formatCompact,
  },
] as const;

export const DEFAULT_METRIC = DISTRIBUTION_METRICS[0]!;
