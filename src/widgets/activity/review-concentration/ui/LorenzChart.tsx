import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LorenzPoint } from '../lib/concentration';

interface LorenzChartProps {
  points: readonly LorenzPoint[];
  gini: number;
}

const COLORS = {
  curve: 'var(--ant-color-primary)',
  equality: 'var(--ant-color-text-quaternary)',
  grid: 'var(--ant-color-split)',
  axis: 'var(--ant-color-text-tertiary)',
} as const;

interface Datum extends LorenzPoint {
  /** Диагональ идеального равенства (y = x). */
  equality: number;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

interface TooltipEntry {
  payload?: Datum;
}
function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  return (
    <div className="weekly-tooltip">
      <div className="weekly-tooltip__title">{pct(d.x)} ревьюеров</div>
      <ul className="weekly-tooltip__list">
        <li className="weekly-tooltip__row">
          <span className="weekly-tooltip__swatch" style={{ background: COLORS.curve }} />
          <span className="weekly-tooltip__label">дают approve</span>
          <span className="weekly-tooltip__value">{pct(d.y)}</span>
        </li>
        <li className="weekly-tooltip__row">
          <span className="weekly-tooltip__swatch" style={{ background: COLORS.equality }} />
          <span className="weekly-tooltip__label">при равенстве</span>
          <span className="weekly-tooltip__value">{pct(d.equality)}</span>
        </li>
      </ul>
    </div>
  );
}

/**
 * Кривая Лоренца на Recharts (в стиле графиков профиля): площадь = накопленная
 * доля approve по ревьюерам от наименее к наиболее активным. Пунктирная
 * диагональ — идеальное равенство; чем сильнее площадь провисает под ней, тем
 * выше концентрация (≈ Gini).
 */
export function LorenzChart({ points, gini }: LorenzChartProps) {
  const data = useMemo<Datum[]>(
    () => points.map((p) => ({ ...p, equality: p.x })),
    [points],
  );

  return (
    <div className="concentration-chart">
      <div className="concentration-chart__caption">
        Кривая Лоренца · <strong>Gini {gini.toFixed(2)}</strong>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="lorenz-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.curve} stopOpacity={0.32} />
              <stop offset="100%" stopColor={COLORS.curve} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 1]}
            stroke={COLORS.axis}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={pct}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
          />
          <YAxis
            type="number"
            domain={[0, 1]}
            stroke={COLORS.axis}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={pct}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: COLORS.curve, strokeOpacity: 0.2 }} />
          <Line
            type="linear"
            dataKey="equality"
            stroke={COLORS.equality}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke={COLORS.curve}
            strokeWidth={2}
            fill="url(#lorenz-gradient)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
