import { describe, expect, it } from 'vitest';
import type { MetricDelta } from '@/entities/performance-review';
import { toTileDelta } from './delta';

const metric = (over: Partial<MetricDelta>): MetricDelta =>
  ({ current: 100, previous: 80, delta: 25, ...over }) as MetricDelta;

describe('toTileDelta', () => {
  it('рост обычной метрики — хорошая новость', () => {
    expect(toTileDelta(metric({ delta: 25 }))).toMatchObject({ up: true, good: true });
  });

  it('падение обычной метрики — плохая', () => {
    expect(toTileDelta(metric({ delta: -30 }))).toMatchObject({ up: false, good: false });
  });

  it('у времени до merge направление и оценка расходятся', () => {
    // Стрелка вверх, но новость плохая: ждать merge стали дольше.
    expect(toTileDelta(metric({ delta: 40 }), { lowerIsBetter: true })).toMatchObject({
      up: true,
      good: false,
    });
    expect(toTileDelta(metric({ delta: -40 }), { lowerIsBetter: true })).toMatchObject({
      up: false,
      good: true,
    });
  });

  it('нечего сравнивать или ничего не изменилось → дельты нет', () => {
    // «0%» рядом с цифрой читался бы как значимый результат.
    expect(toTileDelta(metric({ delta: null }))).toBeUndefined();
    expect(toTileDelta(metric({ delta: 0 }))).toBeUndefined();
  });
});
