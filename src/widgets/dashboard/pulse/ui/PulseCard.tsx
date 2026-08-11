import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from 'antd';
import { GitCommit } from 'lucide-react';
import type { DailyStat } from '@/entities/stats';
import { DeltaBadge } from '@/shared/ui';
import { dayjs, formatNumber, formatPctDelta } from '@/shared/lib';
import { aggregatePulse, peakDay } from '../lib/aggregate-pulse';
import { PulseTooltip } from './PulseTooltip';

interface PulseCardProps {
  daily: readonly DailyStat[];
  /** Всего коммитов за период (из summary) — крупная метрика. */
  totalCommits: number;
  /** Дельта к предыдущему периоду, %. null — сравнивать не с чем. */
  deltaPct: number | null;
  loading?: boolean;
}

/**
 * Пульс команды: главная метрика периода + график коммитов по дням.
 *
 * Заменяет ряд одинаковых плиток вверху дашборда — у страницы появляется точка входа
 * для взгляда: сначала «сколько всего и куда движемся», потом форма периода (провалы,
 * всплески, выходные), и только затем детали ниже.
 */
export function PulseCard({ daily, totalCommits, deltaPct, loading }: PulseCardProps) {
  const points = useMemo(() => aggregatePulse(daily), [daily]);
  const peak = useMemo(() => peakDay(points), [points]);

  if (loading) {
    return (
      <section className="pulse">
        <Skeleton active paragraph={{ rows: 4 }} />
      </section>
    );
  }

  return (
    <section className="pulse">
      <header className="pulse__head">
        <div className="pulse__metric">
          <span className="pulse__label">
            <GitCommit size={14} /> Коммиты за период
          </span>
          <span className="pulse__value">
            {formatNumber(totalCommits)}
            {deltaPct !== null && (
              <DeltaBadge value={deltaPct} format={formatPctDelta} />
            )}
          </span>
        </div>
        {peak && (
          <div className="pulse__peak">
            <span className="pulse__peak-label">Пик активности</span>
            <span className="pulse__peak-value">
              {dayjs(peak.date).format('D MMMM')} · {formatNumber(peak.commits)}
            </span>
          </div>
        )}
      </header>

      <div className="pulse__chart">
        <ResponsiveContainer width="100%" height={148}>
          <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ant-color-primary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--ant-color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--ant-color-split)" />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => dayjs(d).format('D MMM')}
              tick={{ fontSize: 11, fill: 'var(--ant-color-text-quaternary)' }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              width={32}
              tick={{ fontSize: 11, fill: 'var(--ant-color-text-quaternary)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<PulseTooltip />} cursor={{ stroke: 'var(--ant-color-border)' }} />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="var(--ant-color-primary)"
              strokeWidth={2}
              fill="url(#pulse-fill)"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
