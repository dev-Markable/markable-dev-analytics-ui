import { describe, expect, it } from 'vitest';
import { deliveryProgress } from './progress';

describe('deliveryProgress', () => {
  it('обычные значения возвращают 0..1', () => {
    expect(deliveryProgress(0, 6)).toBe(0);
    expect(deliveryProgress(3, 6)).toBe(0.5);
    expect(deliveryProgress(6, 6)).toBe(1);
  });

  it('totalCount = 0 → 0 (без деления на ноль)', () => {
    expect(deliveryProgress(0, 0)).toBe(0);
    expect(deliveryProgress(5, 0)).toBe(0);
  });

  it('clamp: doneCount > totalCount → 1', () => {
    expect(deliveryProgress(8, 6)).toBe(1);
  });

  it('clamp: отрицательные значения → 0', () => {
    expect(deliveryProgress(-1, 6)).toBe(0);
  });
});
