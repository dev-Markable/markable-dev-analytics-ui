import type { ReviewAuthor } from '@/entities/stats';

/** Вовлечённость в ревью = approve + комментарии к чужим MR. */
export const engagementOf = (a: ReviewAuthor): number => a.reviewsGiven + a.commentsGiven;

/** Сортировка по убыванию вовлечённости, tie-break по email. */
export function sortByEngagement(authors: readonly ReviewAuthor[]): ReviewAuthor[] {
  return [...authors].sort(
    (a, b) => engagementOf(b) - engagementOf(a) || a.email.localeCompare(b.email),
  );
}

/**
 * Человекочитаемое время до merge. < 24ч → «N ч», иначе → «N.N дн».
 * 0 / отрицательное (нет данных) → «—».
 */
export function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return '—';
  if (hours < 24) return `${Math.round(hours)} ч`;
  return `${(hours / 24).toFixed(1)} дн`;
}
