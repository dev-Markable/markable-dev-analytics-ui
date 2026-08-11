import type { DailyStat } from '@/entities/stats';
import { countWorkingDays, dayjs, type DateRange } from '@/shared/lib';

export type AnomalyType = 'STALE' | 'DECLINING' | 'LOW_TESTS';

export interface Anomaly {
  type: AnomalyType;
  label: string;
  tooltip: string;
  severity: 'warning' | 'error';
}

/** Пороги эвристик — вынесены, чтобы легко крутить. */
export const ANOMALY_THRESHOLDS = {
  /** РАБОЧИХ дней без коммитов в конце периода → STALE. */
  staleWorkingDays: 4,
  /** Мин. коммитов в первой половине, чтобы считать спад значимым. */
  decliningMinFirstHalf: 5,
  /** Вторая половина < этой доли от первой → DECLINING. */
  decliningRatio: 0.5,
  /** Мин. добавленных строк, чтобы оценивать долю тестов. */
  lowTestsMinAdded: 300,
  /** Доля тестов ниже этого → LOW_TESTS. */
  lowTestsRatio: 0.05,
  /**
   * Минимум РАБОЧИХ дней в каждой половине, чтобы сравнивать темп.
   * На одном-двух днях «спад 100%» — статистический шум: достаточно одного
   * отпускного дня или праздничной недели, чтобы половина осталась пустой.
   */
  decliningMinHalfWorkdays: 3,
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

function detectForAuthor(acc: AuthorDaily, range: DateRange, today: dayjs.Dayjs): Anomaly[] {
  const anomalies: Anomaly[] = [];
  if (acc.dates.length === 0) return anomalies;

  const T = ANOMALY_THRESHOLDS;

  // Конец окна оценки — не позже сегодня: у периода, уходящего в будущее
  // («с начала месяца» до 31-го, произвольный диапазон вперёд), ещё не наступившие
  // дни нельзя считать простоем или спадом — иначе аномалии получают все подряд.
  const endRaw = dayjs(range.to);
  const end = endRaw.isAfter(today, 'day') ? today : endRaw;

  // STALE — давно не коммитил. Считаем рабочие дни ПОСЛЕ последнего коммита по
  // производственному календарю РФ: выходные и праздники простоем не считаются.
  const lastDate = acc.dates[acc.dates.length - 1]!;
  const idleWorkdays = countWorkingDays(dayjs(lastDate).add(1, 'day'), end);
  if (idleWorkdays >= T.staleWorkingDays) {
    anomalies.push({
      type: 'STALE',
      label: `${idleWorkdays} раб. дн без коммитов`,
      tooltip: `Последний коммит ${dayjs(lastDate).format('D MMM')} — с тех пор ${idleWorkdays} рабочих дней без активности`,
      severity: 'warning',
    });
  }

  // DECLINING — спад: вторая половина ПРОШЕДШЕЙ части периода слабее первой.
  // Делим по фактически наступившим дням, иначе будущая половина всегда «пустая».
  const start = dayjs(range.from);
  const elapsedDays = end.diff(start, 'day');
  const mid = start.add(Math.floor(elapsedDays / 2), 'day');
  let first = 0;
  let second = 0;
  for (const [date, n] of acc.nonMergeByDate) {
    const d = dayjs(date);
    if (d.isAfter(end, 'day')) continue; // данные за будущее в расчёт не идут
    if (d.isBefore(mid)) first += n;
    else second += n;
  }

  // Сравниваем ТЕМП (коммитов на рабочий день), а не сырые суммы: половины почти
  // никогда не равны по числу рабочих дней — из-за нечётной длины периода, выходных
  // и праздников. На сырых суммах ровно работающий человек ловил ложный «спад»
  // (особенно если на половину пришлись новогодние каникулы или майские).
  const firstWorkdays = countWorkingDays(start, mid.subtract(1, 'day'));
  const secondWorkdays = countWorkingDays(mid, end);
  const firstRate = first / Math.max(1, firstWorkdays);
  const secondRate = second / Math.max(1, secondWorkdays);

  if (
    firstWorkdays >= T.decliningMinHalfWorkdays &&
    secondWorkdays >= T.decliningMinHalfWorkdays &&
    first >= T.decliningMinFirstHalf &&
    secondRate < firstRate * T.decliningRatio
  ) {
    const drop = Math.round((1 - secondRate / firstRate) * 100);
    anomalies.push({
      type: 'DECLINING',
      label: `спад ${drop}%`,
      tooltip:
        `Темп упал: ${secondRate.toFixed(1)} коммита/раб.день во второй половине ` +
        `против ${firstRate.toFixed(1)} в первой`,
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
 * - STALE — ≥4 РАБОЧИХ дней без коммитов до конца окна оценки.
 * - DECLINING — темп (коммитов на рабочий день) во второй половине прошедшей части
 *   периода < 50% от первой (при ≥5 коммитах в первой и ≥3 рабочих днях в каждой
 *   половине — иначе сравнивать нечего).
 * - LOW_TESTS — доля тестов < 5% при ≥300 добавленных строк.
 *
 * Окно оценки обрезается сегодняшним днём: для периода, уходящего в будущее,
 * ненаступившие дни не считаются ни простоем, ни спадом.
 *
 * @param now подменяется в тестах; по умолчанию — текущая дата
 */
export function detectAnomaliesByAuthor(
  daily: readonly DailyStat[],
  range: DateRange,
  now: dayjs.ConfigType = undefined,
): Map<string, Anomaly[]> {
  const today = dayjs(now);
  const byAuthor = collectByAuthor(daily);
  const result = new Map<string, Anomaly[]>();
  for (const [email, acc] of byAuthor) {
    const anomalies = detectForAuthor(acc, range, today);
    if (anomalies.length > 0) result.set(email, anomalies);
  }
  return result;
}
