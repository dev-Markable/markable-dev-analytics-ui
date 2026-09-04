import { useMemo, useState } from 'react';
import { Table } from 'antd';
import type { AuthorActivity } from '@/entities/user';
import type { DateRange } from '@/shared/lib';
import { AsyncContent, EmptyState, SkeletonTable } from '@/shared/ui';
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

  return (
    <div className="authors-table">
      <AsyncContent
        status={loading ? 'loading' : 'success'}
        isEmpty={totalElements === 0}
        skeleton={<SkeletonTable rows={10} columns={columns.length} />}
        empty={
          <EmptyState
            title="Нет авторов"
            description={
              teamFilterEnabled
                ? 'В команде нет активности в этом периоде.'
                : 'За выбранный период активность не зафиксирована.'
            }
          />
        }
      >
        <Table<AuthorActivity>
          dataSource={items as AuthorActivity[]}
          columns={columns}
          rowKey={(row) => row.email}
          loading={loading}
          size="middle"
          // 7 колонок (включая «Команда» 160px) на узких экранах не помещаются —
          // даём горизонтальный скролл вместо ломки вёрстки.
          scroll={{ x: 'max-content' }}
          pagination={{
            // При 8 авторах из 8 блок «1–8 из 8» с кнопками страниц — чистый шум.
            hideOnSinglePage: true,
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: totalElements,
            showSizeChanger: false,
            showTotal: (total, [from, to]) => `${from}–${to} из ${total}`,
            onChange: (nextPage) => setPage(nextPage - 1),
          }}
        />
      </AsyncContent>
    </div>
  );
}
