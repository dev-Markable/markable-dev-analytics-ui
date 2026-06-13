import { useMemo } from 'react';
import { Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import type { ReviewAuthor, ReviewStats } from '@/entities/stats';
import { useTeamScopeFilter } from '@/features/team-scope';
import { UserAvatar, userDisplayName } from '@/entities/user';
import { TeamChip } from '@/entities/team';
import { buildProfilePath } from '@/app/router/paths';
import { AsyncContent, EmptyState, SectionCard, SkeletonTable } from '@/shared/ui';
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
      sorter: (a, b) => (a.displayName ?? a.email).localeCompare(b.displayName ?? b.email),
      render: (_v, a) => {
        const user = {
          email: a.email,
          name: a.displayName ?? null,
          username: null,
          avatarUrl: a.avatarUrl ?? null,
        };
        return (
          <Link to={buildProfilePath(a.email, range)} className="authors-table__author">
            <UserAvatar user={user} size={30} isLead={a.isLead} />
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
      key: 'team',
      title: 'Команда',
      width: 140,
      sorter: (a, b) => (a.team ?? '').localeCompare(b.team ?? ''),
      render: (_v, a) => <TeamChip team={a.team} />,
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
      sorter: (a, b) => a.reviewsGiven - b.reviewsGiven,
      defaultSortOrder: 'descend',
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
      sorter: (a, b) => a.commentsGiven - b.commentsGiven,
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
      sorter: (a, b) => a.reviewsReceived - b.reviewsReceived,
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
      sorter: (a, b) => a.avgTimeToMergeHours - b.avgTimeToMergeHours,
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

  // Активные ревьюеры = с ненулевой вовлечённостью.
  const activeReviewers = rows.filter((a) => engagementOf(a) > 0).length;

  return (
    <SectionCard
      title="Ревью"
      icon={<MessagesSquare size={16} />}
      description={
        activeReviewers > 0
          ? `${activeReviewers} активных ревьюеров · approve + комментарии к чужим MR`
          : 'Кто ревьюит, объём и время до merge (GitLab MR)'
      }
      bodyClassName="authors-table"
    >
      <AsyncContent
        status={state.status}
        // «Пусто» — после фильтра команды; skeleton/error — только когда вообще
        // нет загруженных авторов (hasData по сырому ответу, до фильтра).
        isEmpty={rows.length === 0}
        hasData={authors.length > 0}
        error={state.error}
        onRetry={onRetry}
        skeleton={<SkeletonTable rows={8} columns={5} />}
        empty={
          <EmptyState
            title="Нет данных о ревью"
            description="За выбранный период ревью-активности не зафиксировано."
          />
        }
      >
        <Table<ReviewAuthor>
          dataSource={rows}
          columns={columns}
          rowKey={(a) => a.email}
          size="middle"
          // Свой Tooltip в заголовках метрик уже объясняет столбец — встроенный
          // sorter-тултип AntD дал бы второй, наложенный поверх.
          showSorterTooltip={false}
          pagination={rows.length > 15 ? { pageSize: 15, showSizeChanger: false } : false}
        />
      </AsyncContent>
    </SectionCard>
  );
}
