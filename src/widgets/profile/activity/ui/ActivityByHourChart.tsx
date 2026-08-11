import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Commit } from '@/entities/commit';
import { formatNumber } from '@/shared/lib';
import { groupByHour } from '../lib/aggregate';
import { ChartTooltip } from '@/shared/ui';

interface ActivityByHourChartProps {
  commits: readonly Commit[];
}

const COLORS = {
  bar: 'var(--ant-color-primary)',
  barMuted: 'var(--ant-color-primary-bg-hover)',
  grid: 'var(--ant-color-split)',
  axis: 'var(--ant-color-text-tertiary)',
} as const;

interface TooltipPayloadEntry {
  value?: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function HourTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const commits = payload[0]?.value as number | undefined;
  return (
    <ChartTooltip
      title={label}
      rows={[{ label: 'Коммитов', swatch: COLORS.bar, value: formatNumber(commits) }]}
    />
  );
}

export function ActivityByHourChart({ commits }: ActivityByHourChartProps) {
  const data = useMemo(() => groupByHour(commits), [commits]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
        <XAxis
          dataKey="label"
          stroke={COLORS.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis
          stroke={COLORS.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
        />
        <Tooltip content={<HourTooltip />} cursor={{ fill: 'rgba(91, 108, 255, 0.06)' }} />
        <Bar dataKey="commits" fill={COLORS.bar} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
