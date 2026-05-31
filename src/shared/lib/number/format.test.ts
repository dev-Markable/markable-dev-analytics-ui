import { describe, expect, it } from 'vitest';
import {
  formatNumber,
  formatPercent,
  formatSigned,
  formatLinesDelta,
  safeDiv,
  pctChange,
  formatPctDelta,
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

describe('pctChange', () => {
  it('рост', () => {
    expect(pctChange(110, 100)).toBe(10);
  });
  it('падение', () => {
    expect(pctChange(80, 100)).toBeCloseTo(-20);
  });
  it('prev = 0 → null (нет базы)', () => {
    expect(pctChange(50, 0)).toBeNull();
  });
  it('без изменений → 0', () => {
    expect(pctChange(100, 100)).toBe(0);
  });
});

describe('formatPctDelta', () => {
  it('плюс с округлением', () => {
    expect(formatPctDelta(12.4)).toBe('+12%');
  });
  it('минус через U+2212', () => {
    expect(formatPctDelta(-8.6)).toBe('−9%');
  });
  it('ноль без знака', () => {
    expect(formatPctDelta(0)).toBe('0%');
  });
  it('округление к нулю → без знака', () => {
    expect(formatPctDelta(0.3)).toBe('0%');
  });
});
