import { useMemo, useState } from 'react';
import { Segmented } from 'antd';
import { BarChart3 } from 'lucide-react';
import type { DashboardData } from '@/entities/dashboard';
import type { AuthorActivity } from '@/entities/user';
import { useTeamScopeFilter } from '@/features/team-scope';
import { AsyncContent, EmptyState, SectionCard } from '@/shared/ui';
import type { AsyncState } from '@/shared/api';
import { computeDistribution, histogram } from '../lib/distribution';
import { DEFAULT_METRIC, DISTRIBUTION_METRICS } from '../config/metrics';
import { HistogramChart } from './HistogramChart';
import { StatStrip } from './StatStrip';

interface DistributionCardProps {
  state: AsyncState<DashboardData>;
  onRetry?: () => void;
}

/**
 * Распределение командной метрики: box-plot + перцентильные плитки. Источник —
 * авторы /dashboard (там заполнен activity со score/avgLinesPerCommit). Скоп
 * команды применяется внутри по полю `team`.
 */
export function DistributionCard({ state, onRetry }: DistributionCardProps) {
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
            <HistogramChart bins={bins} stats={stats} format={metric.format} />
            <StatStrip stats={stats} format={metric.format} />
          </div>
        )}
      </AsyncContent>
    </SectionCard>
  );
}
