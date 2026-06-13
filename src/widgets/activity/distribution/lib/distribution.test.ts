import { describe, expect, it } from 'vitest';
import { computeDistribution, histogram, quantile } from './distribution';

describe('quantile', () => {
  it('пустой массив → NaN', () => {
    expect(quantile([], 0.5)).toBeNaN();
  });

  it('один элемент → он сам для любого q', () => {
    expect(quantile([42], 0)).toBe(42);
    expect(quantile([42], 0.9)).toBe(42);
  });

  it('медиана нечётной длины', () => {
    expect(quantile([1, 2, 3], 0.5)).toBe(2);
  });

  it('медиана чётной длины — интерполяция', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
  });

  it('края: q=0 → min, q=1 → max', () => {
    const s = [10, 20, 30, 40];
    expect(quantile(s, 0)).toBe(10);
    expect(quantile(s, 1)).toBe(40);
  });
});

describe('computeDistribution', () => {
  it('пусто после отсева → null', () => {
    expect(computeDistribution([])).toBeNull();
    expect(computeDistribution([null, undefined, NaN, Infinity])).toBeNull();
  });

  it('отсеивает нечисловые, считает count по чистым', () => {
    const d = computeDistribution([1, null, 2, NaN, 3, undefined])!;
    expect(d.count).toBe(3);
    expect(d.min).toBe(1);
    expect(d.max).toBe(3);
    expect(d.median).toBe(2);
  });

  it('квартили и среднее на ровном ряде 1..9', () => {
    const d = computeDistribution([1, 2, 3, 4, 5, 6, 7, 8, 9])!;
    expect(d.q1).toBe(3);
    expect(d.median).toBe(5);
    expect(d.q3).toBe(7);
    expect(d.mean).toBe(5);
    expect(d.iqr).toBe(4);
  });

  it('выброс уходит за ус, ус тянется до крайней точки внутри забора', () => {
    // 1..10 «тело» + 1000 «бомба». IQR на телe маленький → 1000 за забором.
    const d = computeDistribution([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1000])!;
    expect(d.outliers).toContain(1000);
    expect(d.upperWhisker).toBeLessThan(1000);
    // нижний ус не должен врать — минимум 1 внутри забора
    expect(d.lowerWhisker).toBe(1);
  });

  it('нет выбросов → пустой массив outliers', () => {
    const d = computeDistribution([10, 11, 12, 13, 14])!;
    expect(d.outliers).toEqual([]);
    expect(d.lowerWhisker).toBe(10);
    expect(d.upperWhisker).toBe(14);
  });

  it('одно значение — вырожденное распределение', () => {
    const d = computeDistribution([7])!;
    expect(d).toMatchObject({ count: 1, min: 7, max: 7, median: 7, q1: 7, q3: 7, iqr: 0 });
    expect(d.outliers).toEqual([]);
  });
});

describe('histogram', () => {
  it('пусто / только мусор → []', () => {
    expect(histogram([])).toEqual([]);
    expect(histogram([null, NaN, undefined])).toEqual([]);
  });

  it('все значения равны → один столбец со всеми', () => {
    const bins = histogram([5, 5, 5], 10);
    expect(bins).toHaveLength(1);
    expect(bins[0]).toMatchObject({ x0: 5, x1: 5, count: 3 });
  });

  it('сумма count == числу чистых значений; max в последнем интервале', () => {
    const bins = histogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
    expect(bins).toHaveLength(5);
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(11);
    // 10 (max) обязан попасть в последний бин, а не вывалиться
    expect(bins[bins.length - 1]!.count).toBeGreaterThan(0);
  });

  it('равномерный ряд раскладывается ровно по интервалам', () => {
    // 0..9 на 2 бина: [0..4.5) → 5 значений (0..4), [4.5..9] → 5 значений (5..9)
    const bins = histogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 2);
    expect(bins.map((b) => b.count)).toEqual([5, 5]);
  });

  it('игнорирует нечисловые в выборке', () => {
    const bins = histogram([1, null, 2, NaN, 3], 2);
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(3);
  });
});
