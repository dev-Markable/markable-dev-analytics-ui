import { useMemo } from 'react';
import { Col, Row } from 'antd';
import { CalendarCheck, FolderGit2, GitCommit, Users } from 'lucide-react';
import type { DailyStat } from '@/entities/stats';
import { MetricCard, Sparkline } from '@/shared/ui';
import { formatNumber, formatPercent, safeDiv } from '@/shared/lib';
import { aggregateTotals, dailySeries } from '../lib/aggregate';

interface ActivitySummaryProps {
  daily: readonly DailyStat[];
  daysInRange: number;
}

const SUCCESS = 'var(--ant-color-success)';
const MUTED = 'var(--ant-color-text-tertiary)';

export function ActivitySummary({ daily, daysInRange }: ActivitySummaryProps) {
  const totals = useMemo(() => aggregateTotals(daily), [daily]);
  const series = useMemo(() => dailySeries(daily), [daily]);

  const activeRatio = safeDiv(totals.activeDays, daysInRange) * 100;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} xl={6}>
        <MetricCard
          label="Коммитов"
          value={formatNumber(totals.totalCommits)}
          hint={`${formatNumber(totals.totalMergeCommits)} merge · ${formatNumber(totals.uniqueRepos)} репо`}
          icon={<GitCommit size={16} />}
          sparkline={<Sparkline data={series.commits} />}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <MetricCard
          label="Уникальных авторов"
          value={formatNumber(totals.uniqueAuthors)}
          hint="в выбранном периоде"
          icon={<Users size={16} />}
          sparkline={<Sparkline data={series.authors} />}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <MetricCard
          label="Строк кода"
          value={
            <span style={{ whiteSpace: 'nowrap' }}>
              +{formatNumber(totals.totalAddedLines)}
              <span style={{ color: 'var(--ant-color-text-tertiary)', fontWeight: 500 }}>
                {' / '}
              </span>
              −{formatNumber(totals.totalDeletedLines)}
            </span>
          }
          hint={`тестов: ${formatNumber(totals.totalTestAddedLines)}`}
          icon={<FolderGit2 size={16} />}
          sparkline={<Sparkline data={series.addedLines} color={SUCCESS} />}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <MetricCard
          label="Активных дней"
          value={formatNumber(totals.activeDays)}
          hint={`${formatPercent(activeRatio, 0)} от периода (${daysInRange} дн)`}
          icon={<CalendarCheck size={16} />}
          sparkline={<Sparkline data={series.commits} color={MUTED} />}
        />
      </Col>
    </Row>
  );
}
