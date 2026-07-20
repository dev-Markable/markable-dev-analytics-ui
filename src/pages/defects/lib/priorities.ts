import type { PriorityCounts } from '@/entities/stats';

/**
 * Приоритеты дефектов (Kaiten urgency) в порядке убывания важности + их подписи/цвета.
 * Ключи совпадают с полями {@link PriorityCounts} — используются и как колонки таблицы,
 * и как аккумулятор итогов.
 */
export const PRIORITIES = [
  { key: 'critical', label: 'Критичный', color: '#cf1322' },
  { key: 'high', label: 'Высокий', color: '#d46b08' },
  { key: 'medium', label: 'Средний', color: '#d4b106' },
  { key: 'low', label: 'Низкий', color: '#389e0d' },
  { key: 'unknown', label: 'Не задан', color: '#8c8c8c' },
] as const satisfies ReadonlyArray<{
  key: keyof PriorityCounts;
  label: string;
  color: string;
}>;

export type PriorityKey = (typeof PRIORITIES)[number]['key'];
