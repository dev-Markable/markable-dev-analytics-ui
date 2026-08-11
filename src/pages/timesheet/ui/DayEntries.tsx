import { Tooltip } from 'antd';
import { Sparkles } from 'lucide-react';
import type { TimesheetDay, TimesheetEntry } from '@/entities/stats';
import { formatHours } from '../lib/hours';
import { mrLabel, shortRepo } from '../lib/mr-label';
import { typeMeta } from '../lib/type-meta';

/**
 * Детализация дня: на что списано время. Строка задачи — точка типа, название (ссылка в Kaiten),
 * MR-чипы с номером, AI-бейдж и часы. Без вложенной таблицы: у списка своя визуальная иерархия.
 */
export function DayEntries({ day }: { day: TimesheetDay }) {
  return (
    <div className="ts-entries">
      {day.entries.map((entry) => (
        <EntryRow key={entry.cardId} entry={entry} />
      ))}
    </div>
  );
}

function EntryRow({ entry }: { entry: TimesheetEntry }) {
  const meta = typeMeta(entry.type);
  const title = entry.title ?? `#${entry.cardId}`;

  return (
    <div className="ts-entry">
      <span className={`ts-entry__dot ts-entry__dot--${meta.mod}`} aria-hidden />

      <div className="ts-entry__main">
        {entry.url ? (
          <a className="ts-entry__title" href={entry.url} target="_blank" rel="noreferrer">
            {title}
          </a>
        ) : (
          <span className="ts-entry__title">{title}</span>
        )}
        <span className="ts-entry__sub">
          <span className="ts-entry__type">{meta.label}</span>
          {entry.mergeRequests.map((mr) => (
            <Tooltip key={mr.url} title={mr.repo ?? mr.title ?? 'Merge request'}>
              <a className="ts-mr" href={mr.url} target="_blank" rel="noreferrer">
                {mrLabel(mr.url)}
                {mr.repo && <span style={{ opacity: 0.6 }}>{shortRepo(mr.repo)}</span>}
              </a>
            </Tooltip>
          ))}
        </span>
      </div>

      {entry.aiAgent ? (
        <span className="ts-ai">
          <Sparkles size={10} /> AI
        </span>
      ) : (
        <span />
      )}

      <span className="ts-entry__hours">{formatHours(entry.minutes)} ч</span>
    </div>
  );
}
