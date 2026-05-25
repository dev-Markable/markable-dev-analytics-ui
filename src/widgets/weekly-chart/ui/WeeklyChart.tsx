import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WeeklyStat } from '@/entities/stats';
import { weekShortLabel } from '@/entities/stats';
import { formatCompact } from '@/shared/lib';
import { CHART_COLORS, CHART_HEIGHT } from '../config/series';
import { WeeklyTooltip } from './WeeklyTooltip';

interface WeeklyChartProps {
  data: readonly WeeklyStat[];
}

interface ChartPoint {
  label: string;
  nonMerge: number;
  merge: number;
  addedLines: number;
}

const LEGEND_FORMATTER: Record<string, string> = {
  nonMerge: 'Не-мердж коммиты',
  merge: 'Merge-коммиты',
  addedLines: 'Добавлено строк',
};

export function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData: ChartPoint[] = useMemo(
    () =>
      data.map((w) => ({
        label: weekShortLabel(w),
        nonMerge: w.totalCommits - w.totalMergeCommits,
        merge: w.totalMergeCommits,
        addedLines: w.totalAddedLines,
      })),
    [data],
  );

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="label"
          stroke={CHART_COLORS.axis}
          fontSize={12}
          tickMargin={8}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="left"
          stroke={CHART_COLORS.axis}
          fontSize={12}
          tickFormatter={(v: number) => formatCompact(v)}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke={CHART_COLORS.axis}
          fontSize={12}
          tickFormatter={(v: number) => formatCompact(v)}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip content={<WeeklyTooltip />} cursor={{ fill: 'rgba(91, 108, 255, 0.06)' }} />
        <Legend
          align="left"
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value) => LEGEND_FORMATTER[value as string] ?? value}
          wrapperStyle={{ fontSize: 12, color: 'var(--ant-color-text-secondary)' }}
        />
        <Bar
          yAxisId="left"
          dataKey="nonMerge"
          stackId="commits"
          fill={CHART_COLORS.nonMerge}
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        />
        <Bar
          yAxisId="left"
          dataKey="merge"
          stackId="commits"
          fill={CHART_COLORS.merge}
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="addedLines"
          stroke={CHART_COLORS.addedLines}
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: CHART_COLORS.addedLines }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
