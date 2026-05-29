import { Tag } from 'antd';
import type { KaitenCard, KaitenColumnStatus } from '../model/types';

const STATUS_TONE: Record<KaitenColumnStatus, string> = {
  NEW: 'default',
  IN_PROGRESS: 'processing',
  DONE: 'success',
  UNKNOWN: 'default',
};

interface KaitenStatusBadgeProps {
  card: Pick<KaitenCard, 'columnStatus' | 'columnTitle' | 'archived' | 'closed'>;
}

export function KaitenStatusBadge({ card }: KaitenStatusBadgeProps) {
  if (card.archived) {
    return (
      <Tag bordered={false} color="default" style={{ margin: 0, fontSize: 11 }}>
        В архиве
      </Tag>
    );
  }

  // `closed=true` доминирует над columnStatus — задача завершена.
  // По умолчанию красим тэг по статусу колонки.
  const tone = card.closed ? 'success' : STATUS_TONE[card.columnStatus];
  const label = card.columnTitle || '—';

  return (
    <Tag bordered={false} color={tone} style={{ margin: 0, fontSize: 11 }}>
      {label}
    </Tag>
  );
}
