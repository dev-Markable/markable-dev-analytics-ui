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
import type { Commit } from '@/entities/commit';
import type { DateRange } from '@/shared/lib';
import { formatCompact, formatNumber } from '@/shared/lib';
import { groupByDay } from '../lib/aggregate';
import { ChartTooltip } from '@/shared/ui';

interface ActivityByDayChartProps {
  commits: readonly Commit[];
  range: DateRange;
}

const COLORS = {
  commits: 'var(--ant-color-primary)',
  addedLines: 'var(--ant-color-success)',
  grid: 'var(--ant-color-split)',
  axis: 'var(--ant-color-text-tertiary)',
} as const;

interface TooltipPayloadEntry {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function DayTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const commits = payload.find((p) => p.dataKey === 'commits')?.value;
  const lines = payload.find((p) => p.dataKey === 'addedLines')?.value;
  return (
    <ChartTooltip
      title={label}
      rows={[
        { label: 'Коммитов', swatch: COLORS.commits, value: formatNumber(commits as number) },
        { label: 'Добавлено', swatch: COLORS.addedLines, value: formatNumber(lines as number) },
      ]}
    />
  );
}

export function ActivityByDayChart({ commits, range }: ActivityByDayChartProps) {
  const data = useMemo(() => groupByDay(commits, range), [commits, range]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="profile-commits-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.commits} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.commits} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
        <XAxis
          dataKey="label"
          stroke={COLORS.axis}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={32}
        />
        <YAxis
          yAxisId="left"
          stroke={COLORS.axis}
          fontSize={11}
          tickFormatter={(v: number) => formatCompact(v)}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke={COLORS.axis}
          fontSize={11}
          tickFormatter={(v: number) => formatCompact(v)}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip content={<DayTooltip />} cursor={{ stroke: COLORS.commits, strokeOpacity: 0.2 }} />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="commits"
          stroke={COLORS.commits}
          strokeWidth={2}
          fill="url(#profile-commits-gradient)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="addedLines"
          stroke={COLORS.addedLines}
          strokeWidth={1.5}
          strokeDasharray="3 3"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
