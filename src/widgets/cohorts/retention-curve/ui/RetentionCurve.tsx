import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity } from 'lucide-react';
import type { CohortRetention } from '@/entities/cohort';
import { AsyncContent, EmptyState, SectionCard } from '@/shared/ui';
import type { AsyncState } from '@/shared/api';
import { computeRollingRetention, type RollingPoint } from '../lib/rolling';
import { ChartTooltip } from '@/shared/ui';

interface RetentionCurveProps {
  state: AsyncState<CohortRetention>;
  onRetry?: () => void;
}

const COLORS = {
  line: 'var(--ant-color-primary)',
  grid: 'var(--ant-color-split)',
  axis: 'var(--ant-color-text-tertiary)',
} as const;

const pct = (v: number) => `${Math.round(v * 100)}%`;

function RetentionTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: RollingPoint }[];
}) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  return (
    <ChartTooltip
      title={`Через ${d.offset} мес.`}
      rows={[
        { label: 'Активны', swatch: COLORS.line, value: pct(d.retention) },
        { label: 'Когорт в расчёте', value: d.cohorts },
      ]}
    />
  );
}

/**
 * Усреднённая кривая удержания (rolling retention) — одна линия по всем
 * когортам. Считается на клиенте из того же ответа /cohorts/retention.
 */
export function RetentionCurve({ state, onRetry }: RetentionCurveProps) {
  const points = useMemo(() => computeRollingRetention(state.data), [state.data]);

  return (
    <SectionCard
      title="Кривая удержания"
      icon={<Activity size={16} />}
      description="Доля активных через k месяцев · среднее по всем когортам"
    >
      <AsyncContent
        status={state.status}
        isEmpty={points.length === 0}
        error={state.error}
        onRetry={onRetry}
        skeleton={<div className="cohort-skeleton" />}
        empty={<EmptyState title="Нет данных" description="Когорт за историю не найдено." />}
      >
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={points} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id="retention-curve-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.line} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLORS.line} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
            <XAxis
              dataKey="offset"
              stroke={COLORS.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `+${v}`}
            />
            <YAxis
              domain={[0, 1]}
              stroke={COLORS.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={pct}
              width={40}
            />
            <Tooltip content={<RetentionTooltip />} cursor={{ stroke: COLORS.line, strokeOpacity: 0.2 }} />
            <Area
              type="monotone"
              dataKey="retention"
              stroke={COLORS.line}
              strokeWidth={2}
              fill="url(#retention-curve-gradient)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </AsyncContent>
    </SectionCard>
  );
}
