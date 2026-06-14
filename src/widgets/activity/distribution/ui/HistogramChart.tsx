import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNumber } from '@/shared/lib';
import type { DistributionStats, HistogramBin } from '../lib/distribution';

interface HistogramChartProps {
  bins: readonly HistogramBin[];
  stats: DistributionStats;
  format: (n: number) => string;
  onBinClick?: (bin: HistogramBin) => void;
}

const COLORS = {
  bar: 'var(--ant-color-primary)',
  median: 'var(--ant-color-primary)',
  p75: 'var(--ant-color-text-tertiary)',
  p90: 'var(--ant-color-warning)',
  grid: 'var(--ant-color-split)',
  axis: 'var(--ant-color-text-tertiary)',
} as const;

interface TooltipEntry {
  payload?: HistogramBin;
}
function ChartTooltip({
  active,
  payload,
  format,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  format: (n: number) => string;
}) {
  const b = payload?.[0]?.payload;
  if (!active || !b) return null;
  return (
    <div className="weekly-tooltip">
      <div className="weekly-tooltip__title">
        {format(b.x0)} – {format(b.x1)}
      </div>
      <ul className="weekly-tooltip__list">
        <li className="weekly-tooltip__row">
          <span className="weekly-tooltip__swatch" style={{ background: COLORS.bar }} />
          <span className="weekly-tooltip__label">Разработчиков</span>
          <span className="weekly-tooltip__value">{formatNumber(b.count)}</span>
        </li>
      </ul>
    </div>
  );
}

/**
 * Гистограмма распределения метрики по команде (recharts, в стиле графиков
 * профиля) с вертикальными маркерами медианы, p75 и p90. Столбцы стоят на
 * числовой оси по центру интервала — Recharts сам делает их смежными.
 */
export function HistogramChart({ bins, stats, format, onBinClick }: HistogramChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={bins as HistogramBin[]} margin={{ top: 20, right: 16, bottom: 4, left: 0 }}>
        <defs>
          <linearGradient id="distribution-bar-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.bar} stopOpacity={0.85} />
            <stop offset="100%" stopColor={COLORS.bar} stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
        <XAxis
          dataKey="mid"
          type="number"
          domain={[stats.min, stats.max]}
          stroke={COLORS.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={format}
        />
        <YAxis
          allowDecimals={false}
          stroke={COLORS.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          content={<ChartTooltip format={format} />}
          cursor={{ fill: 'rgba(91, 108, 255, 0.06)' }}
        />

        <ReferenceLine
          x={stats.median}
          stroke={COLORS.median}
          strokeWidth={2}
          label={{ value: 'медиана', position: 'top', fill: COLORS.median, fontSize: 11 }}
        />
        <ReferenceLine
          x={stats.q3}
          stroke={COLORS.p75}
          strokeDasharray="4 4"
          label={{ value: 'p75', position: 'top', fill: COLORS.p75, fontSize: 10 }}
        />
        <ReferenceLine
          x={stats.p90}
          stroke={COLORS.p90}
          strokeDasharray="4 4"
          label={{ value: 'p90', position: 'top', fill: COLORS.p90, fontSize: 10 }}
        />

        <Bar
          dataKey="count"
          fill="url(#distribution-bar-gradient)"
          radius={[4, 4, 0, 0]}
          maxBarSize={56}
          cursor={onBinClick ? 'pointer' : undefined}
          onClick={onBinClick ? (b: HistogramBin) => onBinClick(b) : undefined}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
