import { useCallback, useMemo, useState } from 'react';
import { Table } from 'antd';
import { Users } from 'lucide-react';
import { userDisplayName, type AuthorActivity } from '@/entities/user';
import { downloadCsv, type CsvColumn, type DateRange } from '@/shared/lib';
import { AsyncContent, EmptyState, ExportButton, SectionCard, SkeletonTable } from '@/shared/ui';
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

  const handleExportCsv = useCallback(() => {
    downloadCsv(`devpulse-авторы_${range.from}_${range.to}.csv`, items, csvColumns);
  }, [items, range.from, range.to]);

  return (
    <SectionCard
      title="Все авторы"
      icon={<Users size={16} />}
      description={
        totalElements > 0
          ? `Полный список с пагинацией · ${totalElements} ${teamFilterEnabled ? 'команды' : 'авторов'}`
          : 'Полный список с пагинацией'
      }
      actions={
        totalElements > 0 ? (
          <ExportButton size="small" onExportCsv={handleExportCsv} />
        ) : undefined
      }
      bodyClassName="authors-table"
    >
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
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: totalElements,
            showSizeChanger: false,
            showTotal: (total, [from, to]) => `${from}–${to} из ${total}`,
            onChange: (nextPage) => setPage(nextPage - 1),
          }}
        />
      </AsyncContent>
    </SectionCard>
  );
}
