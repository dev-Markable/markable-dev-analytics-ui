import { dayjs, toISODate, type DateRange } from '@/shared/lib';

export type PerfPeriodKey = 'quarter' | 'half' | 'year' | 'custom';

export interface PerfPeriodPreset {
  key: Exclude<PerfPeriodKey, 'custom'>;
  label: string;
  /** Сколько месяцев назад от сегодня. */
  months: number;
}

/** Пресеты периода для perf-review: квартал / полгода / год. */
export const PERF_PERIOD_PRESETS: readonly PerfPeriodPreset[] = [
  { key: 'quarter', label: 'Квартал', months: 3 },
  { key: 'half', label: 'Полгода', months: 6 },
  { key: 'year', label: 'Год', months: 12 },
];

export const DEFAULT_PERF_PERIOD: PerfPeriodKey = 'quarter';

/** Диапазон [сегодня − N месяцев, сегодня] для пресета. */
export function presetRange(key: Exclude<PerfPeriodKey, 'custom'>): DateRange {
  const months = PERF_PERIOD_PRESETS.find((p) => p.key === key)?.months ?? 3;
  const to = dayjs();
  const from = to.subtract(months, 'month');
  return { from: toISODate(from), to: toISODate(to) };
}

/**
 * Определяет, какому пресету соответствует диапазон (для подсветки Segmented).
 * Сравнение по числу месяцев между from/to, иначе 'custom'.
 */
export function detectPeriodKey(range: DateRange): PerfPeriodKey {
  const months = dayjs(range.to).diff(dayjs(range.from), 'month');
  const match = PERF_PERIOD_PRESETS.find((p) => p.months === months);
  // Дополнительно убеждаемся, что «to» — сегодня (пресеты всегда заканчиваются сегодня).
  const endsToday = dayjs(range.to).isSame(dayjs(), 'day');
  return match && endsToday ? match.key : 'custom';
}
