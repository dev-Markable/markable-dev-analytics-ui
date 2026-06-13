import { useMemo, useState } from 'react';
import { Segmented } from 'antd';
import { BarChart3 } from 'lucide-react';
import type { DashboardData } from '@/entities/dashboard';
import type { AuthorActivity } from '@/entities/user';
import { useTeamScopeFilter } from '@/features/team-scope';
import { AsyncContent, EmptyState, SectionCard } from '@/shared/ui';
import type { AsyncState } from '@/shared/api';
import type { DrillContent } from '@/widgets/activity/drilldown';
import { computeDistribution, histogram, type HistogramBin } from '../lib/distribution';
import { DEFAULT_METRIC, DISTRIBUTION_METRICS } from '../config/metrics';
import { HistogramChart } from './HistogramChart';
import { StatStrip } from './StatStrip';

interface DistributionCardProps {
  state: AsyncState<DashboardData>;
  onDrill: (content: DrillContent) => void;
  onRetry?: () => void;
}

/**
 * Распределение командной метрики: гистограмма + перцентильные плитки. Источник —
 * авторы /dashboard (там заполнен activity со score/avgLinesPerCommit). Скоп
 * команды применяется внутри по полю `team`. Клик по столбцу → drill-down
 * с разработчиками этого бакета.
 */
export function DistributionCard({ state, onDrill, onRetry }: DistributionCardProps) {
  const [metricKey, setMetricKey] = useState<string>(DEFAULT_METRIC.key);
  const metric = useMemo(
    () => DISTRIBUTION_METRICS.find((m) => m.key === metricKey) ?? DEFAULT_METRIC,
    [metricKey],
  );

  const authors = (state.data?.items ?? []) as AuthorActivity[];
  const scoped = useTeamScopeFilter<AuthorActivity>(authors, (a) => a.team);

  const values = useMemo(() => scoped.map(metric.accessor), [scoped, metric]);
  const stats = useMemo(() => computeDistribution(values), [values]);
  // Число интервалов по правилу √n, ограничено 5..15 — мало бинов на маленькой
  // команде не дробят выборку в пыль, много — не оставляют пустых столбцов.
  const bins = useMemo(() => {
    if (!stats) return [];
    const count = Math.max(5, Math.min(15, Math.ceil(Math.sqrt(stats.count))));
    return histogram(values, count);
  }, [values, stats]);

  const handleBinClick = (bin: HistogramBin) => {
    const rows = scoped
      .map((a) => ({ a, v: metric.accessor(a) }))
      .filter((x): x is { a: AuthorActivity; v: number } => x.v != null && x.v >= bin.x0 && x.v <= bin.x1)
      .sort((p, q) => q.v - p.v)
      .map(({ a, v }) => ({
        email: a.email,
        displayName: a.displayName ?? null,
        avatarUrl: a.avatarUrl ?? null,
        team: a.team ?? null,
        isLead: a.isLead,
        stats: [{ label: metric.label, value: metric.format(v) }],
      }));
    onDrill({
      title: `${metric.label}: ${metric.format(bin.x0)} – ${metric.format(bin.x1)}`,
      subtitle: `${rows.length} ${rows.length === 1 ? 'разработчик' : 'разработчиков'} в бакете`,
      rows,
    });
  };

  return (
    <SectionCard
      title="Распределение метрики"
      icon={<BarChart3 size={16} />}
      description={
        stats
          ? `${metric.hint} · n=${stats.count}`
          : 'Медиана и перцентили вместо одного среднего'
      }
      actions={
        <Segmented
          value={metricKey}
          onChange={(v) => setMetricKey(v as string)}
          options={DISTRIBUTION_METRICS.map((m) => ({ label: m.label, value: m.key }))}
        />
      }
    >
      <AsyncContent
        status={state.status}
        isEmpty={stats === null}
        hasData={authors.length > 0}
        error={state.error}
        onRetry={onRetry}
        skeleton={<div className="distribution-skeleton" />}
        empty={
          <EmptyState
            title="Недостаточно данных"
            description="За период нет авторов с этой метрикой для выбранной команды."
          />
        }
      >
        {stats && (
          <div className="distribution-body">
            <HistogramChart
              bins={bins}
              stats={stats}
              format={metric.format}
              onBinClick={handleBinClick}
            />
            <StatStrip stats={stats} format={metric.format} />
          </div>
        )}
      </AsyncContent>
    </SectionCard>
  );
}
