import { Col, Row } from 'antd';
import { GitCommit, Plus, TestTube, Users } from 'lucide-react';
import type { AsyncState } from '@/shared/api';
import type { PeriodSummary } from '@/entities/stats';
import { ErrorState } from '@/shared/ui';
import { formatNumber, formatPercent, safeDiv } from '@/shared/lib';
import { SummaryMetricCard } from './SummaryMetricCard';

interface SummaryGridProps {
  state: AsyncState<PeriodSummary>;
  onRetry?: () => void;
}

export function SummaryGrid({ state, onRetry }: SummaryGridProps) {
  const loading = state.status === 'loading' && !state.data;
  const data = state.data;

  if (state.status === 'error' && !data) {
    return <ErrorState error={state.error} onRetry={onRetry} />;
  }

  const testRatio = data ? safeDiv(data.totalTestAddedLines, data.totalAddedLines) * 100 : 0;
  const mergeRatio = data ? safeDiv(data.totalMergeCommits, data.totalCommits) * 100 : 0;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Коммиты"
          value={formatNumber(data?.totalCommits)}
          hint={data ? `merge-коммитов: ${formatNumber(data.totalMergeCommits)} (${formatPercent(mergeRatio, 1)})` : undefined}
          icon={<GitCommit size={16} />}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Уникальных авторов"
          value={formatNumber(data?.uniqueAuthors)}
          hint={data ? `в выбранном периоде` : undefined}
          icon={<Users size={16} />}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Добавлено строк"
          value={formatNumber(data?.totalAddedLines)}
          hint={data ? `удалено: ${formatNumber(data.totalDeletedLines)}` : undefined}
          icon={<Plus size={16} />}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Тестовых строк"
          value={formatNumber(data?.totalTestAddedLines)}
          hint={data ? `${formatPercent(testRatio, 1)} от добавленных` : undefined}
          icon={<TestTube size={16} />}
          loading={loading}
        />
      </Col>
    </Row>
  );
}
