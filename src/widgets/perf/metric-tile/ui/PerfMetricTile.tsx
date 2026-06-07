import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { MetricDelta } from '@/entities/performance-review';
import { formatNumber, formatHours } from '@/shared/lib';

export interface PerfMetricTileProps {
  /** Подпись плитки (например, «Коммиты»). */
  label: string;
  /** Значение + дельта с бэка. */
  metric: MetricDelta;
  /** Снапшот-метрики (текущее состояние, не история) — дельту скрываем. */
  snapshot?: boolean;
  /** Формат «N ч / N дн» вместо числа. */
  hours?: boolean;
  /** Меньше = лучше (например, время-до-merge): инвертируем тон дельты. */
  lowerIsBetter?: boolean;
  /** Размер плитки. `lg` — крупная (для топовых сюжетов). */
  size?: 'md' | 'lg';
  /** Доп. подпись под значением (напр., «non-merge: 286 / merge: 26»). */
  hint?: string;
  /** Акцент-цвет рамки/фона (для «героического» KPI вроде avg time-to-merge). */
  accent?: 'primary' | 'none';
}

function formatValue(value: number, hours: boolean | undefined): string {
  return hours ? formatHours(value) : formatNumber(value);
}

export function PerfMetricTile({
  label,
  metric,
  snapshot = false,
  hours = false,
  lowerIsBetter = false,
  size = 'md',
  hint,
  accent = 'none',
}: PerfMetricTileProps) {
  const showDelta = !snapshot && metric.delta != null && metric.delta !== 0;

  // Тон дельты: рост обычно «хорошо» (зелёный). Для lowerIsBetter инверсия.
  let tone: 'up' | 'down' | null = null;
  if (showDelta && metric.delta != null) {
    const positive = metric.delta > 0;
    const good = lowerIsBetter ? !positive : positive;
    tone = good ? 'up' : 'down';
  }

  const Arrow = (metric.delta ?? 0) > 0 ? ArrowUpRight : ArrowDownRight;
  const className = [
    'perf-kpi',
    size === 'lg' && 'perf-kpi--lg',
    accent === 'primary' && 'perf-kpi--primary',
  ]
    .filter(Boolean)
    .join(' ');

  // Сравнение возможно, только если бэк прислал previous (включён compareToPrevious
  // и метрика историческая). Иначе foot ничего не показывает — иначе фраза
  // «без изменений» вводила бы в заблуждение, когда сравнение не запрашивалось.
  const hasComparison = !snapshot && metric.previous != null;

  return (
    <div className={className}>
      <div className="perf-kpi__label">{label}</div>
      <div className="perf-kpi__value">{formatValue(metric.current, hours)}</div>
      {hint && <div className="perf-kpi__hint">{hint}</div>}
      <div className="perf-kpi__foot">
        {showDelta && tone ? (
          <span className={`perf-kpi__delta perf-kpi__delta--${tone}`}>
            <Arrow size={12} strokeWidth={2.5} />
            {hours
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
        ) : snapshot ? (
          <span className="perf-kpi__snapshot">снапшот</span>
        ) : hasComparison ? (
          <span className="perf-kpi__flat">на уровне прошлого периода</span>
        ) : null}
      </div>
    </div>
  );
}
