/**
 * Engagement в ревью = approve + комменты к чужим MR. Одно число —
 * для сравнения «как сильно человек участвует в чужих изменениях».
 * Pure-функция; UI использует для split-bar «даёт vs получает».
 */
export const engagement = (reviewsGiven: number, commentsGiven: number): number =>
  reviewsGiven + commentsGiven;

/**
 * Доля «даёт» в паре «даёт vs получает», 0..1. `null` если оба == 0
 * (показать прочерк / empty-state).
 */
export function givenShare(givenSum: number, received: number): number | null {
  const total = givenSum + received;
  if (total === 0) return null;
  return givenSum / total;
}
