import type { ReactNode } from 'react';
import { Col, Row } from 'antd';
import { GitCommit, Plus, TestTube, Users } from 'lucide-react';
import type { DashboardTotals } from '@/entities/dashboard';
import { DeltaBadge } from '@/shared/ui';
import { formatNumber, formatPctDelta, formatPercent, pctChange, safeDiv } from '@/shared/lib';
import { SummaryMetricCard } from './SummaryMetricCard';

interface SummaryGridProps {
  totals: DashboardTotals;
  /** Totals за предыдущий период той же длины — для PoP-дельт. */
  prevTotals?: DashboardTotals | null;
  loading?: boolean;
}

/**
 * Рисует DeltaBadge с процентным изменением curr vs prev.
 * Ничего не рендерит, если базы нет (prev = 0) или prev отсутствует —
 * «+∞%» бессмысленен.
 */
function delta(curr: number, prev: number | undefined): ReactNode {
  if (prev == null) return undefined;
  const pct = pctChange(curr, prev);
  if (pct == null) return undefined;
  return <DeltaBadge value={pct} format={formatPctDelta} />;
}

export function SummaryGrid({ totals, prevTotals, loading }: SummaryGridProps) {
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
          trend={delta(totals.totalCommits, prevTotals?.totalCommits)}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Уникальных авторов"
          value={formatNumber(totals.uniqueAuthors)}
          hint="в выбранном периоде"
          icon={<Users size={16} />}
          trend={delta(totals.uniqueAuthors, prevTotals?.uniqueAuthors)}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Добавлено строк"
          value={formatNumber(totals.totalAddedLines)}
          hint={`удалено: ${formatNumber(totals.totalDeletedLines)}`}
          icon={<Plus size={16} />}
          trend={delta(totals.totalAddedLines, prevTotals?.totalAddedLines)}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <SummaryMetricCard
          label="Тестовых строк"
          value={formatNumber(totals.totalTestAddedLines)}
          hint={`${formatPercent(testRatio, 1)} от добавленных`}
          icon={<TestTube size={16} />}
          trend={delta(totals.totalTestAddedLines, prevTotals?.totalTestAddedLines)}
          loading={loading}
        />
      </Col>
    </Row>
  );
}
