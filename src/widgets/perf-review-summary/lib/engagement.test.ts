import { describe, expect, it } from 'vitest';
import { engagement, givenShare } from './engagement';

describe('engagement', () => {
  it('сумма approve + комментариев', () => {
    expect(engagement(12, 47)).toBe(59);
    expect(engagement(0, 0)).toBe(0);
  });
});

describe('givenShare', () => {
  it('обычное соотношение', () => {
    expect(givenShare(60, 40)).toBeCloseTo(0.6);
    expect(givenShare(20, 80)).toBeCloseTo(0.2);
  });

  it('нулевая активность с обеих сторон → null', () => {
    expect(givenShare(0, 0)).toBeNull();
  });

  it('только «даёт» → 1', () => {
    expect(givenShare(10, 0)).toBe(1);
  });

  it('только «получает» → 0', () => {
    expect(givenShare(0, 10)).toBe(0);
  });
});
