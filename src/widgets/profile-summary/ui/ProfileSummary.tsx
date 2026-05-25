import { Col, Row } from 'antd';
import { CheckCircle2, GitCommit, GitMerge, Kanban, Plus, TestTube } from 'lucide-react';
import { MetricCard } from '@/shared/ui';
import { formatNumber, formatPercent, safeDiv } from '@/shared/lib';
import type { AuthorSummary } from '@/entities/user';
import type { KaitenCard } from '@/entities/kaiten-card';

interface ProfileSummaryProps {
  summary: AuthorSummary;
  cards: readonly KaitenCard[];
}

const CLOSED_STATUSES = new Set(['done', 'closed']);

const isCardClosed = (card: KaitenCard): boolean => {
  if (card.archived) return true;
  if (card.closedAt) return true;
  return CLOSED_STATUSES.has((card.status ?? '').toLowerCase());
};

export function ProfileSummary({ summary, cards }: ProfileSummaryProps) {
  const mergeRatio = safeDiv(summary.mergeCommits, summary.commits) * 100;
  const testRatio = safeDiv(summary.testAddedLines, summary.addedLines) * 100;
  const nonMerge = summary.commits - summary.mergeCommits;

  const closedCards = cards.filter(isCardClosed).length;
  const activeCards = cards.length - closedCards;

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
          value={formatNumber(activeCards)}
          hint={cards.length > 0 ? `из ${formatNumber(cards.length)} всего` : '—'}
          icon={<Kanban size={16} />}
        />
      </Col>
      <Col xs={24} sm={12} md={8} xl={4}>
        <MetricCard
          label="Карточек закрыто"
          value={formatNumber(closedCards)}
          hint={
            cards.length > 0
              ? formatPercent(safeDiv(closedCards, cards.length) * 100, 0)
              : '—'
          }
          icon={<CheckCircle2 size={16} />}
        />
      </Col>
    </Row>
  );
}
