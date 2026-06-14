/**
 * Описательная статистика распределения для одной метрики.
 *
 * Зачем: средние врут. Один STAR с 800 коммитов и десять «тихих» дают красивое
 * среднее, за которым не видно, что половина команды почти не коммитит. Медиана
 * + квартили + перцентили показывают форму распределения, а не одну точку.
 */
export interface DistributionStats {
  /** Сколько значений участвовало (после отсева null/NaN). */
  count: number;
  min: number;
  /** 25-й перцентиль (нижняя граница «коробки»). */
  q1: number;
  /** 50-й перцентиль. */
  median: number;
  /** 75-й перцентиль (верхняя граница «коробки»). */
  q3: number;
  /** 90-й перцентиль — «где живут самые активные». */
  p90: number;
  max: number;
  mean: number;
  /** Межквартильный размах (q3 − q1) — ширина «коробки». */
  iqr: number;
  /** Нижний ус по Тьюки: минимальное значение ≥ q1 − 1.5·IQR. */
  lowerWhisker: number;
  /** Верхний ус по Тьюки: максимальное значение ≤ q3 + 1.5·IQR. */
  upperWhisker: number;
  /** Значения за пределами усов — выбросы (рисуем точками). */
  outliers: number[];
}

/** Отсев нечисловых (null/undefined/NaN/±Infinity). Порядок не меняется. */
export function cleanValues(values: readonly (number | null | undefined)[]): number[] {
  return values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
}

/**
 * Перцентиль `q` ∈ [0, 1] на ОТСОРТИРОВАННОМ по возрастанию массиве.
 * Линейная интерполяция между соседними точками (метод R-7, как в Excel/numpy).
 */
export function quantile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return NaN;
  if (sorted.length === 1) return sorted[0]!;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const lower = sorted[base]!;
  const upper = sorted[base + 1] ?? lower;
  return lower + rest * (upper - lower);
}

/**
 * Считает {@link DistributionStats} по сырому массиву значений.
 * Нечисловые (null/undefined/NaN/±Infinity) отсеиваются. Возвращает null,
 * если после отсева ничего не осталось — вызывающий рисует EmptyState.
 */
export function computeDistribution(values: readonly (number | null | undefined)[]): DistributionStats | null {
  const clean = cleanValues(values);
  if (clean.length === 0) return null;

  const sorted = [...clean].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const p90 = quantile(sorted, 0.9);
  const iqr = q3 - q1;
  const lowFence = q1 - 1.5 * iqr;
  const highFence = q3 + 1.5 * iqr;

  // Усы тянутся до крайних точек ВНУТРИ забора (Тьюки), а не до самого забора.
  const inFence = sorted.filter((v) => v >= lowFence && v <= highFence);
  const lowerWhisker = inFence.length > 0 ? inFence[0]! : sorted[0]!;
  const upperWhisker = inFence.length > 0 ? inFence[inFence.length - 1]! : sorted[sorted.length - 1]!;
  const outliers = sorted.filter((v) => v < lowerWhisker || v > upperWhisker);

  const sum = sorted.reduce((acc, v) => acc + v, 0);

  return {
    count: sorted.length,
    min: sorted[0]!,
    q1,
    median,
    q3,
    p90,
    max: sorted[sorted.length - 1]!,
    mean: sum / sorted.length,
    iqr,
    lowerWhisker,
    upperWhisker,
    outliers,
  };
}

/** Столбец гистограммы: полуинтервал [x0, x1) и число попавших значений. */
export interface HistogramBin {
  x0: number;
  x1: number;
  /** Центр интервала — позиция столбца на числовой оси. */
  mid: number;
  count: number;
}

/**
 * Гистограмма равной ширины по `binCount` интервалам. Значение, равное max,
 * попадает в последний интервал (правая граница включительно). Пустой ввод → [],
 * вырожденный (все значения равны) → один столбец.
 */
export function histogram(
  values: readonly (number | null | undefined)[],
  binCount = 12,
): HistogramBin[] {
  const xs = cleanValues(values);
  if (xs.length === 0) return [];

  const min = Math.min(...xs);
  const max = Math.max(...xs);
  if (min === max) return [{ x0: min, x1: max, mid: min, count: xs.length }];

  const bins = Math.max(1, Math.floor(binCount));
  const width = (max - min) / bins;
  const result: HistogramBin[] = Array.from({ length: bins }, (_, i) => {
    const x0 = min + i * width;
    const x1 = i === bins - 1 ? max : x0 + width;
    return { x0, x1, mid: x0 + width / 2, count: 0 };
  });

  for (const v of xs) {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor((v - min) / width)));
    result[idx]!.count += 1;
  }
  return result;
}
