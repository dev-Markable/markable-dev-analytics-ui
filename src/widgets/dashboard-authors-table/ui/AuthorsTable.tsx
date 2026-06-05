import { useCallback, useMemo, useState } from 'react';
import { Card, Table, Typography } from 'antd';
import { Users } from 'lucide-react';
import { userDisplayName, type AuthorActivity } from '@/entities/user';
import { downloadCsv, type CsvColumn, type DateRange } from '@/shared/lib';
import { EmptyState, ExportButton, SkeletonTable } from '@/shared/ui';
import { buildAuthorsColumns } from '../config/columns';

const csvColumns: CsvColumn<AuthorActivity>[] = [
  { header: 'Автор', value: (a) => userDisplayName({ name: a.displayName ?? null, username: null, email: a.email }) },
  { header: 'Email', value: (a) => a.email },
  { header: 'Категория', value: (a) => a.activity?.category ?? '' },
  { header: 'Score', value: (a) => a.activity?.score ?? '' },
  { header: 'Коммиты', value: (a) => a.commits },
  { header: 'Не-мердж', value: (a) => a.nonMergeCommits },
  { header: 'Merge', value: (a) => a.mergeCommits },
  { header: 'Добавлено', value: (a) => a.addedLines },
  { header: 'Удалено', value: (a) => a.deletedLines },
  { header: 'Тесты', value: (a) => a.testAddedLines },
];

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

  const handleExportCsv = useCallback(() => {
    downloadCsv(`devpulse-авторы_${range.from}_${range.to}.csv`, items, csvColumns);
  }, [items, range.from, range.to]);

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
        {totalElements > 0 && (
          <div className="leaderboard-card__actions">
            <ExportButton size="small" onExportCsv={handleExportCsv} />
          </div>
        )}
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
            // 7 колонок (включая «Команда» 160px) на узких экранах не помещаются —
            // даём горизонтальный скролл вместо ломки вёрстки.
            scroll={{ x: 'max-content' }}
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
