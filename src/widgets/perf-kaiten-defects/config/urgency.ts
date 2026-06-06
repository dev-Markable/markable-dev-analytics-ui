import type { UrgencyCounts } from '@/entities/performance-review';

export type UrgencyKey = keyof UrgencyCounts;

export interface UrgencySpec {
  key: UrgencyKey;
  label: string;
  /** Цвет для donut-сегмента (берём «жёсткие» хексы — палитра AntD warning/error недостаточно дифференцирована для 4-х уровней). */
  color: string;
  hot?: boolean;
}

/** Порядок «критичный → не задана» — слева направо в стэкбаре и в легенде. */
export const URGENCY_SPECS: readonly UrgencySpec[] = [
  { key: 'critical', label: 'Критичный', color: '#dc2626', hot: true },
  { key: 'high', label: 'Высокий', color: '#f97316', hot: true },
  { key: 'medium', label: 'Средний', color: '#eab308' },
  { key: 'low', label: 'Низкий', color: '#22c55e' },
  { key: 'unknown', label: 'Не задана', color: '#94a3b8' },
];
