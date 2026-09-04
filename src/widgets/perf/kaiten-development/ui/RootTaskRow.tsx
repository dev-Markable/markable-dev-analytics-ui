import { useState } from 'react';
import { ChevronRight, ExternalLink, FileQuestion, FolderOpen } from 'lucide-react';
import type { RootTask } from '@/entities/performance-review';
import { UseCaseRow } from './UseCaseRow';

interface RootTaskRowProps {
  root: RootTask;
  /** Синтетическое ведро «Без корневой задачи» (root.id === null). */
  synthetic: boolean;
}

/**
 * Корневая задача с раскрытием юскейсов.
 *
 * Раньше это был AntD Collapse в режиме accordion: строки были голые (иконка,
 * заголовок, серый бейдж с числом), а раскрыть две задачи одновременно было
 * нельзя — при семи корневых сравнить их состав не получалось.
 *
 * Главное добавление — прогресс. Число юскейсов не отвечало на вопрос, ради
 * которого в досье и заглядывают: доведено или висит. Теперь это видно из строки,
 * не раскрывая её.
 */
export function RootTaskRow({ root, synthetic }: RootTaskRowProps) {
  const [open, setOpen] = useState(false);
  const Icon = synthetic ? FileQuestion : FolderOpen;

  const total = root.useCases.length;
  const done = root.useCases.filter((u) => u.status === 'DONE').length;
  const complete = total > 0 && done === total;

  return (
    <div className={`root-task${open ? ' root-task--open' : ''}`}>
      <button
        type="button"
        className="root-task__head"
        onClick={total > 0 ? () => setOpen((v) => !v) : undefined}
        disabled={total === 0}
        aria-expanded={open}
      >
        <span className="root-task__chevron">{total > 0 && <ChevronRight size={15} />}</span>

        <span className="root-task__icon">
          <Icon size={15} />
        </span>

        <span className="root-task__title" title={root.title}>
          {root.title}
        </span>

        <span className="root-task__progress">
          <span className="root-task__bar">
            <span
              className={`root-task__bar-fill${complete ? ' root-task__bar-fill--done' : ''}`}
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </span>
          <span className="root-task__count">
            {done} / {total}
          </span>
        </span>

        {root.url && !synthetic && (
          <a
            href={root.url}
            target="_blank"
            rel="noreferrer noopener"
            className="root-task__link"
            aria-label="Открыть корневую задачу в Kaiten"
            /* Ссылка внутри кнопки-строки: клик не должен раскрывать её. */
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </button>

      {open && (
        <ul className="root-task__use-cases">
          {root.useCases.map((u) => (
            <UseCaseRow key={u.id} useCase={u} />
          ))}
        </ul>
      )}
    </div>
  );
}
