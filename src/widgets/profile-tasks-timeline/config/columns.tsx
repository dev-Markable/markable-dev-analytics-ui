import type { ColumnsType } from 'antd/es/table';
import { Tag, Tooltip, Typography } from 'antd';
import { ExternalLink, FileQuestion } from 'lucide-react';
import { KaitenStatusBadge } from '@/entities/kaiten-card';
import { formatNumber, formatRelative } from '@/shared/lib';
import { ORPHAN_KEY, type TaskGroup } from '../lib/group-commits';

function TaskTitle({ record }: { record: TaskGroup }) {
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

export function buildTaskColumns(): ColumnsType<TaskGroup> {
  return [
    {
      key: 'task',
      title: 'Задача',
      render: (_, record) => <TaskTitle record={record} />,
    },
    {
      key: 'commits',
      title: 'Коммитов',
      align: 'right',
      width: 110,
      render: (_, record) => (
        <span className="authors-table__num">{formatNumber(record.totalCommits)}</span>
      ),
    },
    {
      key: 'lines',
      title: 'Изменено',
      align: 'right',
      width: 160,
      render: (_, record) => (
        <span className="authors-table__num" style={{ whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--ant-color-success)' }}>
            +{formatNumber(record.totalAddedLines)}
          </span>
          <span style={{ color: 'var(--ant-color-text-tertiary)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'var(--ant-color-text-secondary)' }}>
            −{formatNumber(record.totalDeletedLines)}
          </span>
        </span>
      ),
    },
    {
      key: 'tests',
      title: 'Тестов',
      align: 'right',
      width: 90,
      render: (_, record) => (
        <span className="authors-table__num authors-table__num--secondary">
          {formatNumber(record.totalTestAddedLines)}
        </span>
      ),
    },
    {
      key: 'last',
      title: 'Последний коммит',
      align: 'right',
      width: 160,
      render: (_, record) => (
        <Typography.Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
          {record.lastCommitAt ? formatRelative(record.lastCommitAt) : '—'}
        </Typography.Text>
      ),
    },
  ];
}
