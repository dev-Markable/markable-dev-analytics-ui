import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { MetricDelta } from '@/entities/performance-review';
import { formatNumber, formatHours } from '@/shared/lib';
import type { MetricSpec } from '../config/metrics';

interface MetricDeltaCardProps {
  metric: MetricDelta;
  spec: MetricSpec;
}

function formatValue(value: number, spec: MetricSpec): string {
  if (spec.hours) return formatHours(value);
  return formatNumber(value);
}

export function MetricDeltaCard({ metric, spec }: MetricDeltaCardProps) {
  const showDelta = !spec.snapshot && metric.delta != null && metric.delta !== 0;

  // Тон дельты: рост обычно «хорошо» (зелёный). Для времени-до-merge инверсия.
  let tone: 'up' | 'down' | null = null;
  if (showDelta && metric.delta != null) {
    const positive = metric.delta > 0;
    const good = spec.lowerIsBetter ? !positive : positive;
    tone = good ? 'up' : 'down';
  }

  const Arrow = (metric.delta ?? 0) > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="perf-kpi">
      <div className="perf-kpi__label">{spec.label}</div>
      <div className="perf-kpi__value">{formatValue(metric.current, spec)}</div>
      <div className="perf-kpi__foot">
        {showDelta && tone ? (
          <span className={`perf-kpi__delta perf-kpi__delta--${tone}`}>
            <Arrow size={12} strokeWidth={2.5} />
            {spec.hours
              ? formatHours(Math.abs(metric.delta ?? 0))
              : formatNumber(Math.abs(metric.delta ?? 0))}
            {metric.deltaPct != null && (
              <span className="perf-kpi__delta-pct">
                {' '}
                · {metric.deltaPct > 0 ? '+' : '−'}
                {Math.abs(Math.round(metric.deltaPct))}%
              </span>
            )}
          </span>
        ) : spec.snapshot ? (
          <span className="perf-kpi__snapshot">снапшот</span>
        ) : (
          <span className="perf-kpi__flat">без изменений</span>
        )}
      </div>
    </div>
  );
}
