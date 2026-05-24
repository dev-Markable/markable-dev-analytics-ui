import { useMemo } from 'react';
import { Card, Table, Typography } from 'antd';
import { Users } from 'lucide-react';
import type { AsyncState } from '@/shared/api';
import type { DashboardData } from '@/entities/dashboard';
import type { AuthorActivity } from '@/entities/user';
import type { DateRange } from '@/shared/lib';
import { EmptyState, ErrorState, SkeletonTable } from '@/shared/ui';
import { buildAuthorsColumns } from '../config/columns';

interface AuthorsTableProps {
  state: AsyncState<DashboardData>;
  range: DateRange;
  items: readonly AuthorActivity[];
  onPageChange: (page: number, size: number) => void;
  onRetry?: () => void;
  teamFilterEnabled?: boolean;
}

export function AuthorsTable({
  state,
  range,
  items,
  onPageChange,
  onRetry,
  teamFilterEnabled,
}: AuthorsTableProps) {
  const data = state.data;
  const page = data?.page ?? 0;
  const size = data?.size ?? 20;
  const totalElements = data?.totalElements ?? 0;

  const startRank = page * size + 1;

  const columns = useMemo(
    () => buildAuthorsColumns({ range, startRank }),
    [range, startRank],
  );

  const isInitialLoading = state.status === 'loading' && !data;
  const isError = state.status === 'error' && !data;
  const isEmpty = state.status === 'success' && items.length === 0 && page === 0;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Users size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Все авторы
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {totalElements > 0
            ? `Полный список с пагинацией · ${totalElements} авторов`
            : 'Полный список с пагинацией'}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body authors-table">
        {isInitialLoading && <SkeletonTable rows={10} columns={columns.length} />}
        {isError && <ErrorState error={state.error} onRetry={onRetry} />}
        {isEmpty && (
          <EmptyState
            title="Нет авторов"
            description={
              teamFilterEnabled
                ? 'В команде нет активности в этом периоде.'
                : 'За выбранный период активность не зафиксирована.'
            }
          />
        )}
        {!isInitialLoading && !isError && !isEmpty && (
          <Table<AuthorActivity>
            dataSource={items as AuthorActivity[]}
            columns={columns}
            rowKey={(row) => row.email}
            loading={state.status === 'loading'}
            size="middle"
            pagination={{
              current: page + 1,
              pageSize: size,
              total: totalElements,
              showSizeChanger: false,
              showTotal: (total, [from, to]) => `${from}–${to} из ${total}`,
              onChange: (nextPage, nextSize) => onPageChange(nextPage - 1, nextSize),
            }}
          />
        )}
      </div>
    </Card>
  );
}
