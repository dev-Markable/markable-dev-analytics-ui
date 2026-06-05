import type { ReviewAuthor } from '@/entities/stats';

/** Вовлечённость в ревью = approve + комментарии к чужим MR. */
export const engagementOf = (a: ReviewAuthor): number => a.reviewsGiven + a.commentsGiven;

/** Сортировка по убыванию вовлечённости, tie-break по email. */
export function sortByEngagement(authors: readonly ReviewAuthor[]): ReviewAuthor[] {
  return [...authors].sort(
    (a, b) => engagementOf(b) - engagementOf(a) || a.email.localeCompare(b.email),
  );
}

// formatHours переехал в shared/lib/number — реэкспорт для обратной совместимости.
export { formatHours } from '@/shared/lib';
