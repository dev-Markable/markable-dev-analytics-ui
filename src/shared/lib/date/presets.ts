import { lastNDays, lastMonth, thisMonth, thisYear, type DateRange } from './ranges';

export interface DateRangePreset {
  key: string;
  label: string;
  build: () => DateRange;
}

export const DATE_RANGE_PRESETS: readonly DateRangePreset[] = [
  { key: '7d', label: 'Последние 7 дней', build: () => lastNDays(7) },
  { key: '30d', label: 'Последние 30 дней', build: () => lastNDays(30) },
  { key: '90d', label: 'Последние 90 дней', build: () => lastNDays(90) },
  { key: 'mtd', label: 'С начала месяца', build: thisMonth },
  { key: 'lm', label: 'Прошлый месяц', build: lastMonth },
  { key: 'ytd', label: 'С начала года', build: thisYear },
] as const;

export const DEFAULT_PRESET_KEY = '30d';
