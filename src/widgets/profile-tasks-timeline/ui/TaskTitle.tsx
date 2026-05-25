import { Tag, Tooltip, Typography } from 'antd';
import { ExternalLink, FileQuestion } from 'lucide-react';
import { KaitenStatusBadge } from '@/entities/kaiten-card';
import { ORPHAN_KEY, type TaskGroup } from '../lib/group-commits';

interface TaskTitleProps {
  record: TaskGroup;
}

export function TaskTitle({ record }: TaskTitleProps) {
  // Orphan-группа: коммиты без taskNumber
  if (record.key === ORPHAN_KEY) {
    return (
      <span className="task-row__title">
        <span className="task-row__icon" aria-hidden>
          <FileQuestion size={16} />
        </span>
        <span className="task-row__identity">
          <Typography.Text strong className="task-row__name">
            Без задачи Kaiten
          </Typography.Text>
          <Typography.Text type="secondary" className="task-row__meta">
            Коммиты без номера задачи в сообщении
          </Typography.Text>
        </span>
      </span>
    );
  }

  // taskNumber есть, но карточка не найдена (удалена / архив / нет доступа)
  if (!record.card && record.taskNumber) {
    return (
      <span className="task-row__title">
        <Tag bordered={false} className="task-row__tag">
          #{record.taskNumber}
        </Tag>
        <span className="task-row__identity">
          <Typography.Text strong className="task-row__name">
            Карточка не найдена в Kaiten
          </Typography.Text>
          <Typography.Text type="secondary" className="task-row__meta">
            Задача упомянута в коммите, но недоступна
          </Typography.Text>
        </span>
      </span>
    );
  }

  // Полноценная карточка Kaiten
  const card = record.card;
  if (!card) return null;
  const location = [card.spaceName, card.boardName].filter(Boolean).join(' · ');

  const inner = (
    <span className="task-row__title">
      <Tag bordered={false} className="task-row__tag">
        #{card.id}
      </Tag>
      <KaitenStatusBadge card={card} />
      <span className="task-row__identity">
        <Typography.Text strong ellipsis className="task-row__name">
          {card.title}
        </Typography.Text>
        {location && (
          <Typography.Text type="secondary" ellipsis className="task-row__meta">
            {location}
          </Typography.Text>
        )}
      </span>
      {card.url && (
        <Tooltip title="Открыть в Kaiten" mouseEnterDelay={0.4}>
          <ExternalLink size={14} className="task-row__link-icon" />
        </Tooltip>
      )}
    </span>
  );

  if (card.url) {
    return (
      <a
        href={card.url}
        target="_blank"
        rel="noopener noreferrer"
        className="task-row__link"
        aria-label={`Открыть карточку ${card.id}`}
      >
        {inner}
      </a>
    );
  }
  return inner;
}
