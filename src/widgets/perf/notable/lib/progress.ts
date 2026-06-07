/**
 * Доля завершённости фичи как число 0..1.
 * `totalCount === 0` теоретически не должен прийти от бэка
 * (фича с нулём юскейсов отфильтрована), но защищаемся.
 */
export function deliveryProgress(doneCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.min(1, Math.max(0, doneCount / totalCount));
}
