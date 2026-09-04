import type { TimesheetDay } from '@/entities/stats';

/**
 * Минуты → десятичные часы, округление до 0.1 (8.5ч). Контракт отдаёт целые минуты
 * (без потерь), формат для чтения/суммирования — здесь.
 */
export const toHours = (minutes: number): number => Math.round((minutes / 60) * 10) / 10;

/** Часы для показа: «8.5» (без хвостового «.0» → «8»). */
export const formatHours = (minutes: number): string => {
  const hours = toHours(minutes);
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
};

/**
 * Среднее за день со списаниями (не за календарный день периода): дни без логов
 * в знаменатель не идут — иначе отпуск/выходные размывали бы картину.
 */
export const averagePerLoggedDay = (totalMinutes: number, loggedDays: number): number =>
  loggedDays > 0 ? toHours(totalMinutes / loggedDays) : 0;

/** Максимум минут за день — для нормировки бара в таблице. */
export const maxMinutes = (days: readonly TimesheetDay[]): number =>
  days.reduce((max, d) => (d.minutes > max ? d.minutes : max), 0);
