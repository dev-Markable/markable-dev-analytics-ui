import { useMemo, useState } from 'react';
import { Card, Input, Typography } from 'antd';
import { ListTree, Search } from 'lucide-react';
import type { Commit } from '@/entities/commit';
import type { KaitenCard } from '@/entities/kaiten-card';
import { useDebouncedValue } from '@/shared/hooks';
import { DataTable, EmptyState } from '@/shared/ui';
import { buildTaskColumns } from '../config/columns';
import { groupCommitsByTask, ORPHAN_KEY, type TaskGroup } from '../lib/group-commits';
import { TaskCommitsBreakdown } from './TaskCommitsBreakdown';

interface TasksTimelineProps {
  commits: readonly Commit[];
  cards: readonly KaitenCard[];
}

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

export function TasksTimeline({ commits, cards }: TasksTimelineProps) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const allGroups = useMemo(() => groupCommitsByTask(commits, cards), [commits, cards]);

  const filtered = useMemo(() => {
    const q = debounced.trim();
    if (!q) return allGroups;
    return allGroups.filter((g) => matchesQuery(g, q));
  }, [allGroups, debounced]);

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
              debounced
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
