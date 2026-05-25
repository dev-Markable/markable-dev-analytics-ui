import { useMemo, useState } from 'react';
import { Card, Table, Typography } from 'antd';
import { Users } from 'lucide-react';
import type { AuthorActivity } from '@/entities/user';
import type { DateRange } from '@/shared/lib';
import { EmptyState, SkeletonTable } from '@/shared/ui';
import { buildAuthorsColumns } from '../config/columns';

interface AuthorsTableProps {
  items: readonly AuthorActivity[];
  range: DateRange;
  loading?: boolean;
  teamFilterEnabled?: boolean;
}

const PAGE_SIZE = 20;

export function AuthorsTable({
  items,
  range,
  loading,
  teamFilterEnabled,
}: AuthorsTableProps) {
  const [page, setPage] = useState(0);
  const startRank = page * PAGE_SIZE + 1;

  const columns = useMemo(
    () => buildAuthorsColumns({ range, startRank }),
    [range, startRank],
  );

  const totalElements = items.length;
  const isInitialLoading = loading && totalElements === 0;
  const isEmpty = !loading && totalElements === 0;

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
            ? `Полный список с пагинацией · ${totalElements} ${teamFilterEnabled ? 'команды' : 'авторов'}`
            : 'Полный список с пагинацией'}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body authors-table">
        {isInitialLoading && <SkeletonTable rows={10} columns={columns.length} />}
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
        {!isInitialLoading && !isEmpty && (
          <Table<AuthorActivity>
            dataSource={items as AuthorActivity[]}
            columns={columns}
            rowKey={(row) => row.email}
            loading={loading}
            size="middle"
            pagination={{
              current: page + 1,
              pageSize: PAGE_SIZE,
              total: totalElements,
              showSizeChanger: false,
              showTotal: (total, [from, to]) => `${from}–${to} из ${total}`,
              onChange: (nextPage) => setPage(nextPage - 1),
            }}
          />
        )}
      </div>
    </Card>
  );
}
