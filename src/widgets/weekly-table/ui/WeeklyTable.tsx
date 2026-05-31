import { useCallback, useMemo, useState } from 'react';
import { Card, Table, Typography } from 'antd';
import { CalendarDays } from 'lucide-react';
import type { AsyncState } from '@/shared/api';
import type { WeeklyStat } from '@/entities/stats';
import { useTeamFilter } from '@/features/team-filter';
import { downloadCsv, type CsvColumn, type DateRange } from '@/shared/lib';
import type { AuthorActivity } from '@/entities/user';
import { EmptyState, ErrorState, ExportButton, SkeletonTable } from '@/shared/ui';
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
  const teamEnabled = useExpandedRowsReset();
  const columns = useMemo(() => buildWeeklyColumns(), []);
  const data = useMemo(() => state.data ?? [], [state.data]);

  const isInitialLoading = state.status === 'loading' && data.length === 0;
  const isError = state.status === 'error' && data.length === 0;
  const isEmpty = state.status === 'success' && data.length === 0;

  const handleExportCsv = useCallback(() => {
    downloadCsv(`devpulse-недели_${range.from}_${range.to}.csv`, data, csvColumns);
  }, [data, range.from, range.to]);

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <CalendarDays size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Недели
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Каждая неделя раскрывается в разбивку по авторам
        </Typography.Text>
        {!isInitialLoading && !isError && !isEmpty && (
          <div className="leaderboard-card__actions">
            <ExportButton size="small" onExportCsv={handleExportCsv} />
          </div>
        )}
      </header>

      <div className="leaderboard-card__body authors-table">
        {isInitialLoading && <SkeletonTable rows={6} columns={columns.length} />}
        {isError && <ErrorState error={state.error} onRetry={onRetry} />}
        {isEmpty && (
          <EmptyState
            title="Нет данных"
            description="За выбранный период недельных агрегатов нет."
          />
        )}
        {!isInitialLoading && !isError && !isEmpty && (
          <Table<WeeklyStat>
            dataSource={data as WeeklyStat[]}
            columns={columns}
            rowKey={(row) => `${row.year}-${row.week}`}
            loading={state.status === 'loading'}
            size="middle"
            pagination={false}
            expandable={{
              expandedRowKeys: teamEnabled.expandedKeys,
              onExpandedRowsChange: (keys) => teamEnabled.setExpandedKeys([...keys]),
              expandedRowRender: (record) => (
                <WeekFilteredBreakdown authors={record.authors} range={range} />
              ),
            }}
          />
        )}
      </div>
    </Card>
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
  const filtered = useTeamFilter<AuthorActivity>(authors, (a) => a.email);
  return <WeekAuthorsBreakdown authors={filtered} range={range} />;
}

/**
 * Локальное состояние раскрытых строк. Хранит keys для AntD Table.
 */
function useExpandedRowsReset() {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  return { expandedKeys, setExpandedKeys };
}
