import type { AuthorActivity } from '@/entities/user';
import type { ReviewAuthor } from '@/entities/stats';

export interface MyWeek {
  me: AuthorActivity;
  /** Позиция в общем рейтинге (1 — первый), считается по тому же порядку, что и лидерборд. */
  rank: number;
  total: number;
  reviewsGiven: number;
  commentsGiven: number;
}

/**
 * Находит вошедшего пользователя среди авторов периода и его позицию в рейтинге.
 *
 * `items` уже отсортированы бэком по activity score, поэтому позиция — это индекс.
 * Нет коммитов за период → `null`: блок скрывается, а не показывает нули (для отпуска
 * или новичка «0 из 42» читалось бы как антидостижение).
 */
export function findMyWeek(
  email: string | null | undefined,
  items: readonly AuthorActivity[],
  reviews: readonly ReviewAuthor[],
): MyWeek | null {
  if (!email) return null;
  const needle = email.toLowerCase();

  const index = items.findIndex((a) => a.email.toLowerCase() === needle);
  if (index < 0) return null;

  const me = items[index];
  if (!me) return null;

  const review = reviews.find((r) => r.email.toLowerCase() === needle);

  return {
    me,
    rank: index + 1,
    total: items.length,
    reviewsGiven: review?.reviewsGiven ?? 0,
    commentsGiven: review?.commentsGiven ?? 0,
  };
}
