import { Tag } from 'antd';
import type { KaitenCard } from '../model/types';

const STATUS_TONE: Record<string, string> = {
  queued: 'default',
  open: 'default',
  in_progress: 'processing',
  in_review: 'warning',
  blocked: 'error',
  done: 'success',
  closed: 'success',
  archived: 'default',
};

const STATUS_LABEL: Record<string, string> = {
  queued: 'В очереди',
  open: 'Открыта',
  in_progress: 'В работе',
  in_review: 'На ревью',
  blocked: 'Заблокирована',
  done: 'Готова',
  closed: 'Закрыта',
  archived: 'В архиве',
};

interface KaitenStatusBadgeProps {
  card: Pick<KaitenCard, 'status' | 'columnName' | 'archived'>;
}

export function KaitenStatusBadge({ card }: KaitenStatusBadgeProps) {
  if (card.archived) {
    return (
      <Tag bordered={false} color="default" style={{ margin: 0, fontSize: 11 }}>
        В архиве
      </Tag>
    );
  }

  const key = (card.status ?? '').toLowerCase();
  const tone = STATUS_TONE[key] ?? 'default';
  const label = STATUS_LABEL[key] ?? card.columnName ?? card.status ?? '—';

  return (
    <Tag bordered={false} color={tone} style={{ margin: 0, fontSize: 11 }}>
      {label}
    </Tag>
  );
}
