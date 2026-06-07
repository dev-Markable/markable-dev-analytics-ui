import type { DailyStat } from '@/entities/stats';
import { dayjs, type DateRange } from '@/shared/lib';

export type AnomalyType = 'STALE' | 'DECLINING' | 'LOW_TESTS';

export interface Anomaly {
  type: AnomalyType;
  label: string;
  tooltip: string;
  severity: 'warning' | 'error';
}

/** Пороги эвристик — вынесены, чтобы легко крутить. */
export const ANOMALY_THRESHOLDS = {
  /** Дней без коммитов в конце периода → STALE. */
  staleDays: 5,
  /** Мин. коммитов в первой половине, чтобы считать спад значимым. */
  decliningMinFirstHalf: 5,
  /** Вторая половина < этой доли от первой → DECLINING. */
  decliningRatio: 0.5,
  /** Мин. добавленных строк, чтобы оценивать долю тестов. */
  lowTestsMinAdded: 300,
  /** Доля тестов ниже этого → LOW_TESTS. */
  lowTestsRatio: 0.05,
} as const;

interface AuthorDaily {
  dates: string[]; // дни с активностью (nonMerge > 0)
  nonMergeByDate: Map<string, number>;
  totalAdded: number;
  totalTest: number;
}

function collectByAuthor(daily: readonly DailyStat[]): Map<string, AuthorDaily> {
  const map = new Map<string, AuthorDaily>();
  for (const d of daily) {
    const nonMerge = d.commits - d.mergeCommits;
    let acc = map.get(d.email);
    if (!acc) {
      acc = { dates: [], nonMergeByDate: new Map(), totalAdded: 0, totalTest: 0 };
      map.set(d.email, acc);
    }
    acc.totalAdded += d.addedLines;
    acc.totalTest += d.testAddedLines;
    if (nonMerge > 0) {
      acc.nonMergeByDate.set(d.date, (acc.nonMergeByDate.get(d.date) ?? 0) + nonMerge);
    }
  }
  for (const acc of map.values()) {
    acc.dates = [...acc.nonMergeByDate.keys()].sort();
  }
  return map;
}

function detectForAuthor(acc: AuthorDaily, range: DateRange): Anomaly[] {
  const anomalies: Anomaly[] = [];
  if (acc.dates.length === 0) return anomalies;

  const T = ANOMALY_THRESHOLDS;

  // STALE — давно не коммитил (от последней активности до конца периода).
  const lastDate = acc.dates[acc.dates.length - 1]!;
  const daysSince = dayjs(range.to).diff(dayjs(lastDate), 'day');
  if (daysSince >= T.staleDays) {
    anomalies.push({
      type: 'STALE',
      label: `${daysSince} дн без коммитов`,
      tooltip: `Последний коммит ${dayjs(lastDate).format('D MMM')}, ${daysSince} дней назад`,
      severity: 'warning',
    });
  }

  // DECLINING — спад: вторая половина периода заметно слабее первой.
  const mid = dayjs(range.from).add(dayjs(range.to).diff(dayjs(range.from), 'day') / 2, 'day');
  let first = 0;
  let second = 0;
  for (const [date, n] of acc.nonMergeByDate) {
    if (dayjs(date).isBefore(mid)) first += n;
    else second += n;
  }
  if (first >= T.decliningMinFirstHalf && second < first * T.decliningRatio) {
    const drop = Math.round((1 - second / first) * 100);
    anomalies.push({
      type: 'DECLINING',
      label: `спад ${drop}%`,
      tooltip: `Во второй половине периода ${second} коммитов против ${first} в первой`,
      severity: 'error',
    });
  }

  // LOW_TESTS — много кода, мало тестов.
  if (acc.totalAdded >= T.lowTestsMinAdded) {
    const ratio = acc.totalTest / acc.totalAdded;
    if (ratio < T.lowTestsRatio) {
      anomalies.push({
        type: 'LOW_TESTS',
        label: 'мало тестов',
        tooltip: `Тесты ${(ratio * 100).toFixed(1)}% от добавленного кода (${acc.totalTest} из ${acc.totalAdded})`,
        severity: 'warning',
      });
    }
  }

  return anomalies;
}

/**
 * Детектирует аномалии активности по каждому автору из daily-статов.
 * Возвращает Map email → флаги (пустые массивы не включаются).
 *
 * Эвристики:
 * - STALE — ≥5 дней без коммитов до конца периода.
 * - DECLINING — вторая половина периода < 50% первой (при ≥5 коммитах в первой).
 * - LOW_TESTS — доля тестов < 5% при ≥300 добавленных строк.
 */
export function detectAnomaliesByAuthor(
  daily: readonly DailyStat[],
  range: DateRange,
): Map<string, Anomaly[]> {
  const byAuthor = collectByAuthor(daily);
  const result = new Map<string, Anomaly[]>();
  for (const [email, acc] of byAuthor) {
    const anomalies = detectForAuthor(acc, range);
    if (anomalies.length > 0) result.set(email, anomalies);
  }
  return result;
}
