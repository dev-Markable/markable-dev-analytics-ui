import { describe, expect, it } from 'vitest';
import {
  formatNumber,
  formatPercent,
  formatSigned,
  formatLinesDelta,
  safeDiv,
} from './format';

describe('formatNumber', () => {
  it('null/undefined → placeholder', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
  });

  it('маленькие числа без разделителя', () => {
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(0)).toBe('0');
  });

  it('тысячи разделяются (любой whitespace-separator)', () => {
    expect(formatNumber(1000).replace(/\s/g, '')).toBe('1000');
    expect(formatNumber(1234567).replace(/\s/g, '')).toBe('1234567');
  });
});

describe('formatPercent', () => {
  it('форматирует с дефолтным округлением до целого', () => {
    expect(formatPercent(48)).toBe('48%');
  });
  it('уважает digits', () => {
    expect(formatPercent(48.04, 1)).toBe('48.0%');
  });
  it('null → placeholder', () => {
    expect(formatPercent(null)).toBe('—');
  });
});

describe('formatSigned', () => {
  it('ноль без знака', () => {
    expect(formatSigned(0)).toBe('0');
  });
  it('плюс по флагу', () => {
    expect(formatSigned(5, { positiveSign: true })).toBe('+5');
  });
  it('без флага плюс не ставится', () => {
    expect(formatSigned(5)).toBe('5');
  });
});

describe('formatLinesDelta', () => {
  it('собирает +added / −deleted', () => {
    expect(formatLinesDelta(10, 3)).toBe('+10 / −3');
  });
});

describe('safeDiv', () => {
  it('делит', () => {
    expect(safeDiv(10, 2)).toBe(5);
  });
  it('деление на ноль → 0, без Infinity/NaN', () => {
    expect(safeDiv(10, 0)).toBe(0);
    expect(safeDiv(0, 0)).toBe(0);
  });
});
