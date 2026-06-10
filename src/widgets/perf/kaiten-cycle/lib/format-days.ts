/**
 * Формат cycle-time:
 * - `null`/`undefined` → прочерк;
 * - меньше суток → часы (округление до целого);
 * - 1..10 дней → одна десятичная;
 * - 10+ дней → целое число дней.
 *
 * Не использует locale: на «дн/ч» консистентно по всему UI.
 */
export function formatDays(days: number | null | undefined): string {
  if (days == null) return '—';
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours} ч`;
  }
  return days < 10 ? `${days.toFixed(1)} дн` : `${Math.round(days)} дн`;
}
