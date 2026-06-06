/**
 * Доля тестового кода от добавленных строк, % (0..100).
 * Если `addedLines === 0` — null (показать прочерк, % бессмысленен).
 *
 * Pure-функция; UI читает результат и решает как отрисовать.
 */
export function testRatio(testAddedLines: number, addedLines: number): number | null {
  if (addedLines <= 0) return null;
  return Math.round((testAddedLines / addedLines) * 100);
}
