import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dayjs } from '@/shared/lib';
import { detectPeriodKey, presetRange } from './periods';

// Замораживаем «сегодня» — пресеты вычисляются от `dayjs()`, без фикс-времени
// тест будет дребезжать на границе суток.
const FROZEN_TODAY = '2026-05-15T12:00:00';

describe('presetRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FROZEN_TODAY));
  });
  afterEach(() => vi.useRealTimers());

  it('quarter = сегодня − 3 месяца … сегодня', () => {
    const r = presetRange('quarter');
    expect(r.to).toBe('2026-05-15');
    expect(r.from).toBe('2026-02-15');
  });

  it('half = сегодня − 6 месяцев … сегодня', () => {
    const r = presetRange('half');
    expect(r.to).toBe('2026-05-15');
    expect(r.from).toBe('2025-11-15');
  });

  it('year = сегодня − 12 месяцев … сегодня', () => {
    const r = presetRange('year');
    expect(r.to).toBe('2026-05-15');
    expect(r.from).toBe('2025-05-15');
  });
});

describe('detectPeriodKey', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FROZEN_TODAY));
  });
  afterEach(() => vi.useRealTimers());

  it('диапазон, совпадающий с пресетом, определяется по ключу', () => {
    expect(detectPeriodKey(presetRange('quarter'))).toBe('quarter');
    expect(detectPeriodKey(presetRange('half'))).toBe('half');
    expect(detectPeriodKey(presetRange('year'))).toBe('year');
  });

  it('кастомная длина → custom', () => {
    expect(detectPeriodKey({ from: '2026-04-01', to: '2026-05-15' })).toBe('custom');
  });

  it('длина совпадает с пресетом, но to не сегодня → custom (исторический срез)', () => {
    // Год длиной, но заканчивается месяц назад — это уже не «год до сегодня».
    expect(detectPeriodKey({ from: '2025-04-15', to: '2026-04-15' })).toBe('custom');
  });

  it('to сегодня, но длина не совпадает ни с одним пресетом → custom', () => {
    const to = dayjs().format('YYYY-MM-DD');
    const from = dayjs().subtract(2, 'month').format('YYYY-MM-DD');
    expect(detectPeriodKey({ from, to })).toBe('custom');
  });
});
