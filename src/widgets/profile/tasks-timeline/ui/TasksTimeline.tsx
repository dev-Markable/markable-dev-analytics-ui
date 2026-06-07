import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { Card, Input, Typography } from 'antd';
import { ListTree, Search } from 'lucide-react';
import { extractCardId, type Commit } from '@/entities/commit';
import type { KaitenCard } from '@/entities/kaiten-card';
import { useDebouncedValue } from '@/shared/hooks';
import { downloadCsv, formatDateTime, type CsvColumn } from '@/shared/lib';
import { DataTable, EmptyState, ExportButton } from '@/shared/ui';
import { buildTaskColumns } from '../config/columns';
import { groupCommitsByTask, ORPHAN_KEY, type TaskGroup } from '../lib/group-commits';
import { TaskCommitsBreakdown } from './TaskCommitsBreakdown';

interface TasksTimelineProps {
  commits: readonly Commit[];
  cards: readonly KaitenCard[];
  /** email — для имени файла экспорта. */
  email: string;
}

const commitCsvColumns: CsvColumn<Commit>[] = [
  { header: 'Дата', value: (c) => formatDateTime(c.commitDate) },
  { header: 'Репозиторий', value: (c) => c.repo },
  { header: 'Карточка Kaiten', value: (c) => extractCardId(c) ?? '' },
  { header: 'Merge', value: (c) => (c.merge ? 'да' : 'нет') },
  { header: 'Добавлено', value: (c) => c.addedLines },
  { header: 'Удалено', value: (c) => c.deletedLines },
  { header: 'Тесты', value: (c) => c.testAddedLines },
  { header: 'Сообщение', value: (c) => c.message },
  { header: 'Хеш', value: (c) => c.hash },
];

const SEARCH_DEBOUNCE_MS = 250;

const matchesQuery = (group: TaskGroup, q: string): boolean => {
  if (!q) return true;
  const lower = q.toLowerCase();
  if (group.taskNumber?.toLowerCase().includes(lower)) return true;
  if (group.card?.title.toLowerCase().includes(lower)) return true;
  if (group.card?.description?.toLowerCase().includes(lower)) return true;
  return group.commits.some(
    (c) =>
      c.message.toLowerCase().includes(lower) ||
      c.repo.toLowerCase().includes(lower) ||
      c.hash.toLowerCase().includes(lower),
  );
};

export function TasksTimeline({ commits, cards, email }: TasksTimelineProps) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  // useDeferredValue делает фильтрацию неблокирующей: React оставляет инпут
  // отзывчивым, а тяжёлый refilter тысяч задач уходит в фоновую транзакцию.
  // Пара с useDebouncedValue: debounce убирает дрожание ввода (250 мс),
  // deferred — гарантирует что даже после debounce фильтр не лочит UI.
  const deferredQuery = useDeferredValue(debounced);

  const handleExportCsv = useCallback(() => {
    const safeEmail = email.replace(/[^a-z0-9]+/gi, '-');
    downloadCsv(`devpulse-коммиты_${safeEmail}.csv`, commits, commitCsvColumns);
  }, [commits, email]);

  const allGroups = useMemo(() => groupCommitsByTask(commits, cards), [commits, cards]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim();
    if (!q) return allGroups;
    return allGroups.filter((g) => matchesQuery(g, q));
  }, [allGroups, deferredQuery]);

  const columns = useMemo(() => buildTaskColumns(), []);

  const totalTasks = allGroups.length;
  const orphanCount = allGroups.find((g) => g.key === ORPHAN_KEY)?.totalCommits ?? 0;
  const description =
    totalTasks > 0
      ? `${totalTasks} задач${orphanCount > 0 ? ` · ${orphanCount} коммитов без задачи` : ''}`
      : 'Задач и коммитов нет';

  const isEmpty = filtered.length === 0;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <ListTree size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Задачи и коммиты
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {description}
        </Typography.Text>
        {commits.length > 0 && (
          <div className="leaderboard-card__actions">
            <ExportButton size="small" onExportCsv={handleExportCsv} />
          </div>
        )}
      </header>

      <div className="leaderboard-card__body authors-table">
        <Input
          placeholder="Поиск по задаче, сообщению, репозиторию…"
          prefix={<Search size={14} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          allowClear
          style={{ maxWidth: 480, marginBottom: 12 }}
        />

        {isEmpty ? (
          <EmptyState
            title="Ничего не найдено"
            description={
              deferredQuery
                ? 'Уточните запрос или очистите фильтр.'
                : 'За выбранный период нет задач и коммитов.'
            }
          />
        ) : (
          <DataTable<TaskGroup>
            data={filtered}
            status="success"
            columns={columns}
            rowKey={(row) => row.key}
            scroll={{ x: 'max-content' }}
            expandable={{
              expandedRowRender: (record) => <TaskCommitsBreakdown commits={record.commits} />,
              rowExpandable: (record) => record.commits.length > 0,
            }}
            pagination={{
              pageSize: 25,
              showSizeChanger: false,
              showTotal: (total, [from, to]) => `${from}–${to} из ${total}`,
            }}
          />
        )}
      </div>
    </Card>
  );
}
