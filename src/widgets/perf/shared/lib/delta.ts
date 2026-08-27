import type { MetricDelta } from '@/entities/performance-review';
import type { StatTileDelta } from '@/shared/ui';
import { formatPctDelta } from '@/shared/lib';

/**
 * MetricDelta с бэка → дельта для плитки.
 *
 * Направление и оценка разделены осознанно: у времени до merge рост — плохая
 * новость, у коммитов — хорошая, а стрелка в обоих случаях смотрит вверх.
 *
 * Нулевая и отсутствующая дельта не показываются вовсе: «0%» рядом с цифрой
 * читается как значимый результат, хотя означает лишь «сравнивать не с чем или
 * ничего не изменилось».
 */
export function toTileDelta(
  metric: MetricDelta,
  opts: { lowerIsBetter?: boolean } = {},
): StatTileDelta | undefined {
  const delta = metric.delta;
  if (delta == null || delta === 0) return undefined;

  const up = delta > 0;
  return {
    text: formatPctDelta(delta),
    up,
    good: opts.lowerIsBetter ? !up : up,
  };
}
