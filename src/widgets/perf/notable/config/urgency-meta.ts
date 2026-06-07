import type { FirefightingUrgency } from '@/entities/performance-review';

/**
 * На практике в firefighting приходят только CRITICAL и HIGH (так фильтрует бэк),
 * но контракт допускает любой `FirefightingUrgency` — нарисуем все, чтобы не уронить
 * UI на расхождении контракта и данных.
 */
export const URGENCY_META: Record<FirefightingUrgency, { label: string; color: string }> = {
  CRITICAL: { label: 'Критичный', color: '#dc2626' },
  HIGH: { label: 'Высокий', color: '#f97316' },
  MEDIUM: { label: 'Средний', color: '#eab308' },
  LOW: { label: 'Низкий', color: '#22c55e' },
  UNKNOWN: { label: 'Не задан', color: '#94a3b8' },
};
