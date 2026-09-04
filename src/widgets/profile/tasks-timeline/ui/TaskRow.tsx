import { useState } from 'react';
import { ChevronRight, ExternalLink, FileQuestion } from 'lucide-react';
import { CardTypeBadge, KaitenStatusBadge } from '@/entities/kaiten-card';
import { formatNumber, formatRelative } from '@/shared/lib';
import { ORPHAN_KEY, type TaskGroup } from '../lib/group-commits';
import { TaskCommitsBreakdown } from './TaskCommitsBreakdown';

interface TaskRowProps {
  task: TaskGroup;
}

/** Заголовок и подпись строки — три разных случая: карточка, потерянная карточка, orphan. */
function identity(task: TaskGroup): { title: string; meta: string } {
  if (task.key === ORPHAN_KEY) {
    return { title: 'Без задачи Kaiten', meta: 'Коммиты без номера задачи в сообщении' };
  }
  if (!task.card) {
    return {
      title: 'Карточка не найдена в Kaiten',
      meta: 'Задача упомянута в коммите, но недоступна',
    };
  }
  return {
    title: task.card.title,
    meta: [task.card.spaceName, task.card.boardName].filter(Boolean).join(' · '),
  };
}

/**
 * Строка задачи: номер, тип, статус, название и цифры вклада. Клик раскрывает коммиты.
 *
 * Раньше это была таблица с колонками — на длинных названиях задач она уезжала в
 * горизонтальный скролл, а строка не давала иерархии. Список с раскрытием (как в
 * таймшите) читается сверху вниз и оставляет названию всю ширину.
 */
export function TaskRow({ task }: TaskRowProps) {
  const [open, setOpen] = useState(false);
  const { title, meta } = identity(task);
  const card = task.card;
  const expandable = task.commits.length > 0;
  // Карточка назначена, но коммитов в периоде нет. Крашеные «+0 / −0» в таких
  // строках — шум: у людей с большим бэклогом они занимали половину списка.
  const idle = task.totalCommits === 0;

  return (
    <div className={`task-row${open ? ' task-row--open' : ''}`}>
      <button
        type="button"
        className="task-row__head"
        onClick={expandable ? () => setOpen((v) => !v) : undefined}
        disabled={!expandable}
        aria-expanded={open}
      >
        <span className="task-row__chevron">{expandable && <ChevronRight size={15} />}</span>

        <span className="task-row__badges">
          {task.key === ORPHAN_KEY ? (
            <span className="task-row__orphan" aria-hidden>
              <FileQuestion size={14} />
            </span>
          ) : (
            <span className="task-row__id">#{card?.id ?? task.taskNumber}</span>
          )}
          {card && <CardTypeBadge cardType={card.cardType} iconOnly />}
          {card && <KaitenStatusBadge card={card} />}
        </span>

        <span className="task-row__identity">
          <span className="task-row__name">{title}</span>
          {meta && <span className="task-row__meta">{meta}</span>}
        </span>

        <span className={`task-row__metric${idle ? ' task-row__metric--idle' : ''}`}>
          <span className="task-row__metric-value">{formatNumber(task.totalCommits)}</span>
          <span className="task-row__metric-label">коммитов</span>
        </span>

        <span className="task-row__lines">
          {idle ? (
            <span className="task-row__dash">—</span>
          ) : (
            <>
              <span className="task-row__added">+{formatNumber(task.totalAddedLines)}</span>
              <span className="task-row__deleted">−{formatNumber(task.totalDeletedLines)}</span>
            </>
          )}
        </span>

        <span className="task-row__when">
          {task.lastCommitAt ? formatRelative(task.lastCommitAt) : '—'}
        </span>

        {card?.url && (
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="task-row__link"
            aria-label={`Открыть карточку ${card.id} в Kaiten`}
            /* Ссылка внутри кнопки-строки: клик не должен раскрывать её. */
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </button>

      {open && <TaskCommitsBreakdown commits={task.commits} />}
    </div>
  );
}
