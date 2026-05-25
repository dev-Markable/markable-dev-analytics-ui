import { Col, Row } from 'antd';
import { GitCommit, Plus, TestTube, Users } from 'lucide-react';
import type { DashboardTotals } from '@/entities/dashboard';
import { SummaryMetricCard } from './SummaryMetricCard';
import { formatNumber, formatPercent, safeDiv } from '@/shared/lib';

interface SummaryGridProps {
  totals: DashboardTotals;
  loading?: boolean;
}

export function SummaryGrid({ totals, loading }: SummaryGridProps) {
  const testRatio = safeDiv(totals.totalTestAddedLines, totals.totalAddedLines) * 100;
  const mergeRatio = safeDiv(totals.totalMergeCommits, totals.totalCommits) * 100;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Коммиты"
          value={formatNumber(totals.totalCommits)}
          hint={`merge: ${formatNumber(totals.totalMergeCommits)} (${formatPercent(mergeRatio, 1)})`}
          icon={<GitCommit size={16} />}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Уникальных авторов"
          value={formatNumber(totals.uniqueAuthors)}
          hint="в выбранном периоде"
          icon={<Users size={16} />}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Добавлено строк"
          value={formatNumber(totals.totalAddedLines)}
          hint={`удалено: ${formatNumber(totals.totalDeletedLines)}`}
          icon={<Plus size={16} />}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Тестовых строк"
          value={formatNumber(totals.totalTestAddedLines)}
          hint={`${formatPercent(testRatio, 1)} от добавленных`}
          icon={<TestTube size={16} />}
          loading={loading}
        />
      </Col>
    </Row>
  );
}
