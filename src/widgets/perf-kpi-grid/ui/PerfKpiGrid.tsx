import { Typography } from 'antd';
import type { PerformanceMetrics } from '@/entities/performance-review';
import { GROUP_LABEL, METRIC_SPECS, type MetricSpec } from '../config/metrics';
import { MetricDeltaCard } from './MetricDeltaCard';

interface PerfKpiGridProps {
  metrics: PerformanceMetrics;
}

const GROUPS: MetricSpec['group'][] = ['code', 'review', 'tasks'];

export function PerfKpiGrid({ metrics }: PerfKpiGridProps) {
  return (
    <div className="perf-kpi-groups">
      {GROUPS.map((group) => {
        const specs = METRIC_SPECS.filter((s) => s.group === group);
        return (
          <section key={group} className="perf-kpi-group">
            <Typography.Text type="secondary" className="perf-kpi-group__title">
              {GROUP_LABEL[group]}
            </Typography.Text>
            <div className="perf-kpi-grid">
              {specs.map((spec) => (
                <MetricDeltaCard key={spec.key} spec={spec} metric={metrics[spec.key]} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
