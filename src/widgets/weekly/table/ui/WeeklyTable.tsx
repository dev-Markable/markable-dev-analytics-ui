import { useCallback, useMemo, useState, type Key } from 'react';
import { Table } from 'antd';
import { CalendarDays } from 'lucide-react';
import type { AsyncState } from '@/shared/api';
import type { WeeklyStat } from '@/entities/stats';
import { useTeamScopeFilter } from '@/features/team-scope';
import { downloadCsv, type CsvColumn, type DateRange } from '@/shared/lib';
import type { AuthorActivity } from '@/entities/user';
import { AsyncContent, EmptyState, ExportButton, SectionCard, SkeletonTable } from '@/shared/ui';
import { buildWeeklyColumns } from '../config/columns';
import { WeekAuthorsBreakdown } from './WeekAuthorsBreakdown';

const csvColumns: CsvColumn<WeeklyStat>[] = [
  { header: 'Год', value: (w) => w.year },
  { header: 'Неделя', value: (w) => w.week },
  { header: 'Начало недели', value: (w) => w.weekStart },
  { header: 'Коммиты', value: (w) => w.totalCommits },
  { header: 'Merge', value: (w) => w.totalMergeCommits },
  { header: 'Добавлено', value: (w) => w.totalAddedLines },
  { header: 'Удалено', value: (w) => w.totalDeletedLines },
  { header: 'Тесты', value: (w) => w.totalTestAddedLines },
  { header: 'Авторов', value: (w) => w.authors.length },
];

interface WeeklyTableProps {
  state: AsyncState<WeeklyStat[]>;
  range: DateRange;
  onRetry?: () => void;
}

export function WeeklyTable({ state, range, onRetry }: WeeklyTableProps) {
  // Локальное состояние раскрытых строк (keys для AntD Table).
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const columns = useMemo(() => buildWeeklyColumns(), []);
  const data = useMemo(() => state.data ?? [], [state.data]);
  const hasData = data.length > 0;

  const handleExportCsv = useCallback(() => {
    downloadCsv(`devpulse-недели_${range.from}_${range.to}.csv`, data, csvColumns);
  }, [data, range.from, range.to]);

  return (
    <SectionCard
      title="Недели"
      icon={<CalendarDays size={16} />}
      description="Каждая неделя раскрывается в разбивку по авторам"
      actions={
        hasData ? <ExportButton size="small" onExportCsv={handleExportCsv} /> : undefined
      }
      bodyClassName="authors-table"
    >
      <AsyncContent
        status={state.status}
        isEmpty={!hasData}
        error={state.error}
        onRetry={onRetry}
        skeleton={<SkeletonTable rows={6} columns={columns.length} />}
        empty={
          <EmptyState
            title="Нет данных"
            description="За выбранный период недельных агрегатов нет."
          />
        }
      >
        <Table<WeeklyStat>
          dataSource={data as WeeklyStat[]}
          columns={columns}
          rowKey={(row) => `${row.year}-${row.week}`}
          loading={state.status === 'loading'}
          size="middle"
          pagination={false}
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpandedRowsChange: (keys) => setExpandedKeys([...keys]),
            expandedRowRender: (record) => (
              <WeekFilteredBreakdown authors={record.authors} range={range} />
            ),
          }}
        />
      </AsyncContent>
    </SectionCard>
  );
}

/**
 * Применяет фильтр команды к авторам конкретной недели.
 */
function WeekFilteredBreakdown({
  authors,
  range,
}: {
  authors: AuthorActivity[];
  range: DateRange;
}) {
  const filtered = useTeamScopeFilter<AuthorActivity>(authors, (a) => a.team);
  return <WeekAuthorsBreakdown authors={filtered} range={range} />;
}
