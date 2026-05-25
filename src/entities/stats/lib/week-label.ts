import { dayjs } from '@/shared/lib';
import type { WeeklyStat } from '../model/types';

/**
 * Конец ISO-недели = weekStart + 6 дней.
 */
export const weekEnd = (week: Pick<WeeklyStat, 'weekStart'>): string =>
  dayjs(week.weekStart).add(6, 'day').format('YYYY-MM-DD');

/**
 * Короткий лейбл для оси графика: «W19 · 4 мая».
 */
export const weekShortLabel = (week: Pick<WeeklyStat, 'week' | 'weekStart'>): string =>
  `W${week.week} · ${dayjs(week.weekStart).format('D MMM')}`;

/**
 * Полный лейбл для таблицы: «Неделя 19 · 4–10 мая 2026».
 */
export const weekFullLabel = (week: Pick<WeeklyStat, 'week' | 'year' | 'weekStart'>): string => {
  const start = dayjs(week.weekStart);
  const end = start.add(6, 'day');
  const sameMonth = start.month() === end.month();
  const datesPart = sameMonth
    ? `${start.format('D')}–${end.format('D MMM')}`
    : `${start.format('D MMM')} – ${end.format('D MMM')}`;
  return `Неделя ${week.week} · ${datesPart} ${week.year}`;
};
