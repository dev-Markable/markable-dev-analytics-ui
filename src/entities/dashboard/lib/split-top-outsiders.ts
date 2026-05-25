import type { AuthorActivity } from '@/entities/user';

export interface TopOutsidersSplit {
  top: AuthorActivity[];
  outsiders: AuthorActivity[];
}

/**
 * Делит отсортированный по убыванию список авторов на «топ» и «аутсайдеров».
 *
 * Логика:
 * - Если авторов 2× и больше maxPerSide — обычное N / N (без пересечения, посередине люди есть в таблице «Все авторы»).
 * - Если меньше — делим пополам с округлением вверх в пользу топа.
 * - Если 1 человек — он в топе, аутсайдеры пустые.
 * - Если 0 — обе пустые.
 *
 * Гарантирует: top и outsiders НЕ пересекаются.
 * Outsiders реверснуты — первая строка = абсолютный минимум.
 */
export function splitTopAndOutsiders(
  sorted: readonly AuthorActivity[],
  maxPerSide: number,
): TopOutsidersSplit {
  const len = sorted.length;
  if (len === 0) return { top: [], outsiders: [] };
  if (len === 1) return { top: [sorted[0] as AuthorActivity], outsiders: [] };

  let topCount: number;
  let outsiderCount: number;

  if (len >= maxPerSide * 2) {
    topCount = maxPerSide;
    outsiderCount = maxPerSide;
  } else {
    topCount = Math.ceil(len / 2);
    outsiderCount = len - topCount;
  }

  const top = sorted.slice(0, topCount);
  const outsiders =
    outsiderCount > 0 ? [...sorted.slice(-outsiderCount)].reverse() : [];

  return { top: top as AuthorActivity[], outsiders };
}
