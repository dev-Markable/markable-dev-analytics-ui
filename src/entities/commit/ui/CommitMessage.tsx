import { Tag, Typography } from 'antd';
import type { Commit } from '../model/types';
import { truncate } from '@/shared/lib';
import { extractCardId, stripTaskPrefix } from '../lib/task-id';

interface CommitMessageProps {
  commit: Pick<Commit, 'message' | 'taskNumber' | 'merge'>;
  maxLength?: number;
}

export function CommitMessage({ commit, maxLength = 140 }: CommitMessageProps) {
  const body = truncate(stripTaskPrefix(commit.message), maxLength);
  // Реальный ID карточки = часть после дефиса (если есть). Бэк отдаёт
  // только номер пространства, поэтому парсим клиентом.
  const cardId = extractCardId(commit);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      {commit.merge && (
        <Tag color="processing" bordered={false} style={{ margin: 0, fontSize: 11 }}>
          merge
        </Tag>
      )}
      {cardId && (
        <Tag
          bordered={false}
          style={{
            margin: 0,
            fontSize: 11,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          }}
        >
          #{cardId}
        </Tag>
      )}
      <Typography.Text ellipsis style={{ fontSize: 13 }}>
        {body}
      </Typography.Text>
    </span>
  );
}
