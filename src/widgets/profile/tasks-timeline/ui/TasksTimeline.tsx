import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Input } from 'antd';
import { ListTree, Search } from 'lucide-react';
import { extractCardId, type Commit } from '@/entities/commit';
import type { KaitenCard } from '@/entities/kaiten-card';
import { useDebouncedValue } from '@/shared/hooks';
import { downloadCsv, formatDateTime, type CsvColumn } from '@/shared/lib';
import { EmptyState, ExportButton, SectionCard } from '@/shared/ui';
import { groupCommitsByTask, ORPHAN_KEY, type TaskGroup } from '../lib/group-commits';
import { TaskRow } from './TaskRow';

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
/** Сколько задач показываем сразу. Дальше — по кнопке: в списке пагинация избыточна. */
const PAGE_SIZE = 20;

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
  const [shown, setShown] = useState(PAGE_SIZE);

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

  // Новый фильтр — снова первая «страница»: иначе после поиска по узкому запросу
  // остаётся раскрытым длинный хвост от предыдущего.
  useEffect(() => setShown(PAGE_SIZE), [deferredQuery]);


  const totalTasks = allGroups.length;
  const orphanCount = allGroups.find((g) => g.key === ORPHAN_KEY)?.totalCommits ?? 0;
  const description =
    totalTasks > 0
      ? `${totalTasks} задач${orphanCount > 0 ? ` · ${orphanCount} коммитов без задачи` : ''}`
      : 'Задач и коммитов нет';

  const isEmpty = filtered.length === 0;

  return (
    <SectionCard
      title="По карточкам Kaiten"
      icon={<ListTree size={16} />}
      description={description}
      actions={commits.length > 0 && <ExportButton size="small" onExportCsv={handleExportCsv} />}
    >
      <div className="tasks-timeline">
        <Input
          placeholder="Поиск по задаче, сообщению, репозиторию…"
          prefix={<Search size={14} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          allowClear
          className="tasks-timeline__search"
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
          <>
            <div className="tasks-list">
              {filtered.slice(0, shown).map((task) => (
                <TaskRow key={task.key} task={task} />
              ))}
            </div>
            {filtered.length > shown && (
              <button
                type="button"
                className="tasks-list__more"
                onClick={() => setShown((n) => n + PAGE_SIZE)}
              >
                Показать ещё {Math.min(PAGE_SIZE, filtered.length - shown)} из{' '}
                {filtered.length - shown}
              </button>
            )}
          </>
        )}
      </div>
    </SectionCard>
  );
}
