import { describe, expect, it } from 'vitest';
import { previousPeriod, rangeDays } from './ranges';

describe('previousPeriod', () => {
  it('7-дневный период → предыдущие 7 дней вплотную', () => {
    expect(previousPeriod({ from: '2026-05-08', to: '2026-05-14' })).toEqual({
      from: '2026-05-01',
      to: '2026-05-07',
    });
  });

  it('один день → предыдущий день', () => {
    expect(previousPeriod({ from: '2026-05-10', to: '2026-05-10' })).toEqual({
      from: '2026-05-09',
      to: '2026-05-09',
    });
  });

  it('сохраняет длину периода', () => {
    const r = { from: '2026-04-23', to: '2026-05-23' };
    const prev = previousPeriod(r);
    expect(rangeDays(prev)).toBe(rangeDays(r));
  });

  it('предыдущий период заканчивается за день до начала текущего', () => {
    const r = { from: '2026-05-08', to: '2026-05-14' };
    expect(previousPeriod(r).to).toBe('2026-05-07');
  });

  it('корректно переходит через границу месяца', () => {
    expect(previousPeriod({ from: '2026-05-01', to: '2026-05-03' })).toEqual({
      from: '2026-04-28',
      to: '2026-04-30',
    });
  });
});
