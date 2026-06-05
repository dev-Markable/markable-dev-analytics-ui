import { useMemo } from 'react';
import { Card, Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import type { ReviewAuthor, ReviewStats } from '@/entities/stats';
import { useTeamScopeFilter } from '@/features/team-scope';
import { UserAvatar, userDisplayName } from '@/entities/user';
import { buildProfilePath } from '@/app/router/paths';
import { EmptyState, ErrorState, SkeletonTable } from '@/shared/ui';
import { formatNumber, type DateRange } from '@/shared/lib';
import type { AsyncState } from '@/shared/api';
import { engagementOf, formatHours, sortByEngagement } from '../lib/reviews';

interface ReviewsCardProps {
  state: AsyncState<ReviewStats>;
  range: DateRange;
  onRetry?: () => void;
}

const num = (v: number) => <span className="authors-table__num">{formatNumber(v)}</span>;

function buildColumns(range: DateRange): ColumnsType<ReviewAuthor> {
  return [
    {
      key: 'author',
      title: 'Ревьюер',
      render: (_v, a) => {
        const user = {
          email: a.email,
          name: a.displayName ?? null,
          username: null,
          avatarUrl: a.avatarUrl ?? null,
        };
        return (
          <Link to={buildProfilePath(a.email, range)} className="authors-table__author">
            <UserAvatar user={user} size={30} />
            <span className="authors-table__identity">
              <Typography.Text className="authors-table__name">
                {userDisplayName(user)}
              </Typography.Text>
              <Typography.Text className="authors-table__email">{a.email}</Typography.Text>
            </span>
          </Link>
        );
      },
    },
    {
      key: 'reviewsGiven',
      title: (
        <Tooltip title="Чужих MR с Approve (distinct по MR)">
          <span>Approve</span>
        </Tooltip>
      ),
      align: 'right',
      width: 110,
      render: (_v, a) => num(a.reviewsGiven),
    },
    {
      key: 'commentsGiven',
      title: (
        <Tooltip title="Ревью-комментарии к чужим MR (объём)">
          <span>Комментов</span>
        </Tooltip>
      ),
      align: 'right',
      width: 120,
      render: (_v, a) => num(a.commentsGiven),
    },
    {
      key: 'reviewsReceived',
      title: (
        <Tooltip title="Сколько MR автора отревьюили другие">
          <span>Получено</span>
        </Tooltip>
      ),
      align: 'right',
      width: 110,
      render: (_v, a) => (
        <span className="authors-table__num authors-table__num--secondary">
          {formatNumber(a.reviewsReceived)}
        </span>
      ),
    },
    {
      key: 'ttm',
      title: (
        <Tooltip title="Среднее время от открытия MR до merge">
          <span>Ср. до merge</span>
        </Tooltip>
      ),
      align: 'right',
      width: 120,
      render: (_v, a) => (
        <span className="authors-table__num authors-table__num--secondary">
          {formatHours(a.avgTimeToMergeHours)}
        </span>
      ),
    },
  ];
}

export function ReviewsCard({ state, range, onRetry }: ReviewsCardProps) {
  const authors = state.data?.authors ?? [];
  const teamFiltered = useTeamScopeFilter<ReviewAuthor>(authors, (a) => a.team);
  const rows = useMemo(() => sortByEngagement(teamFiltered), [teamFiltered]);
  const columns = useMemo(() => buildColumns(range), [range]);

  const isInitialLoading = state.status === 'loading' && authors.length === 0;
  const isError = state.status === 'error' && authors.length === 0;
  // Активные ревьюеры = с ненулевой вовлечённостью.
  const activeReviewers = rows.filter((a) => engagementOf(a) > 0).length;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <MessagesSquare size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Ревью
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {activeReviewers > 0
            ? `${activeReviewers} активных ревьюеров · approve + комментарии к чужим MR`
            : 'Кто ревьюит, объём и время до merge (GitLab MR)'}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body authors-table">
        {isInitialLoading && <SkeletonTable rows={8} columns={5} />}
        {isError && <ErrorState error={state.error} onRetry={onRetry} />}
        {!isInitialLoading && !isError && rows.length === 0 && (
          <EmptyState
            title="Нет данных о ревью"
            description="За выбранный период ревью-активности не зафиксировано."
          />
        )}
        {!isInitialLoading && !isError && rows.length > 0 && (
          <Table<ReviewAuthor>
            dataSource={rows}
            columns={columns}
            rowKey={(a) => a.email}
            size="middle"
            pagination={rows.length > 15 ? { pageSize: 15, showSizeChanger: false } : false}
          />
        )}
      </div>
    </Card>
  );
}
