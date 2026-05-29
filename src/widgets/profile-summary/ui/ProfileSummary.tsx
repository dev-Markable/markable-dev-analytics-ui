import { useMemo } from 'react';
import { Col, Row } from 'antd';
import { CheckCircle2, GitCommit, GitMerge, Kanban, Plus, TestTube } from 'lucide-react';
import { MetricCard } from '@/shared/ui';
import { formatNumber, formatPercent, safeDiv } from '@/shared/lib';
import type { AuthorSummary } from '@/entities/user';
import type { KaitenCard } from '@/entities/kaiten-card';
import { summarizeCards } from '../lib/aggregate-cards';

interface ProfileSummaryProps {
  summary: AuthorSummary;
  cards: readonly KaitenCard[];
}

/**
 * Хелпер для hint'а карточек — собирает «X разработка · Y дефекты» или
 * показывает только непустую часть.
 */
const typeBreakdown = (dev: number, defect: number): string => {
  const parts: string[] = [];
  if (dev > 0) parts.push(`${dev} разработка`);
  if (defect > 0) parts.push(`${defect} дефект${defect === 1 ? '' : 'ы'}`);
  return parts.join(' · ');
};

export function ProfileSummary({ summary, cards }: ProfileSummaryProps) {
  const mergeRatio = safeDiv(summary.mergeCommits, summary.commits) * 100;
  const testRatio = safeDiv(summary.testAddedLines, summary.addedLines) * 100;
  const nonMerge = summary.commits - summary.mergeCommits;

  const c = useMemo(() => summarizeCards(cards), [cards]);
  const activeHint = typeBreakdown(c.activeDev, c.activeDefect) || `из ${formatNumber(c.total)} всего`;
  const closedHint = c.total > 0
    ? typeBreakdown(c.closedDev, c.closedDefect) ||
      formatPercent(safeDiv(c.closed, c.total) * 100, 0)
    : '—';

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8} xl={4}>
        <MetricCard
          label="Коммитов всего"
          value={formatNumber(summary.commits)}
          hint={`не-мердж: ${formatNumber(nonMerge)}`}
          icon={<GitCommit size={16} />}
        />
      </Col>
      <Col xs={24} sm={12} md={8} xl={4}>
        <MetricCard
          label="Merge-коммитов"
          value={formatNumber(summary.mergeCommits)}
          hint={`${formatPercent(mergeRatio, 1)} от всех`}
          icon={<GitMerge size={16} />}
        />
      </Col>
      <Col xs={24} sm={12} md={8} xl={4}>
        <MetricCard
          label="Добавлено / удалено"
          value={
            <span style={{ whiteSpace: 'nowrap' }}>
              {formatNumber(summary.addedLines)}
              <span style={{ color: 'var(--ant-color-text-tertiary)', fontWeight: 500 }}>
                {' / '}
              </span>
              {formatNumber(summary.deletedLines)}
            </span>
          }
          hint="строк"
          icon={<Plus size={16} />}
        />
      </Col>
      <Col xs={24} sm={12} md={8} xl={4}>
        <MetricCard
          label="Тестовых строк"
          value={formatNumber(summary.testAddedLines)}
          hint={`${formatPercent(testRatio, 1)} от добавленных`}
          icon={<TestTube size={16} />}
        />
      </Col>
      <Col xs={24} sm={12} md={8} xl={4}>
        <MetricCard
          label="Карточек в работе"
          value={formatNumber(c.active)}
          hint={activeHint}
          icon={<Kanban size={16} />}
        />
      </Col>
      <Col xs={24} sm={12} md={8} xl={4}>
        <MetricCard
          label="Карточек закрыто"
          value={formatNumber(c.closed)}
          hint={closedHint}
          icon={<CheckCircle2 size={16} />}
        />
      </Col>
    </Row>
  );
}
