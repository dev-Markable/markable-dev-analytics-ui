import { describe, expect, it } from 'vitest';
import { formatDays } from './format-days';

describe('formatDays', () => {
  it('null/undefined → прочерк', () => {
    expect(formatDays(null)).toBe('—');
    expect(formatDays(undefined)).toBe('—');
  });

  it('меньше суток → часы', () => {
    expect(formatDays(0.5)).toBe('12 ч');
    expect(formatDays(0.25)).toBe('6 ч');
    expect(formatDays(0.0001)).toBe('0 ч');
  });

  it('от 1 до 10 дней → десятичная точность', () => {
    expect(formatDays(1)).toBe('1.0 дн');
    expect(formatDays(3.7)).toBe('3.7 дн');
    // Граница: 9.99 округляется toFixed(1) до 10.0 — это ожидаемо.
    expect(formatDays(9.99)).toBe('10.0 дн');
  });

  it('10+ дней → целое', () => {
    expect(formatDays(10)).toBe('10 дн');
    expect(formatDays(15.4)).toBe('15 дн');
    expect(formatDays(15.6)).toBe('16 дн');
  });
});
