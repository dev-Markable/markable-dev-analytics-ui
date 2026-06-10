import type { ReactNode } from 'react';
import { Tag } from 'antd';
import { AlertTriangle, Ban, CheckCircle2, Loader2 } from 'lucide-react';
import type { CollectionRunStatus } from '../model/types';

const STATUS_TONE: Record<CollectionRunStatus, string> = {
  RUNNING: 'processing',
  SUCCESS: 'success',
  FAILED: 'error',
  CANCELLED: 'warning',
};

const STATUS_LABEL: Record<CollectionRunStatus, string> = {
  RUNNING: 'Выполняется',
  SUCCESS: 'Успешно',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменён',
};

const STATUS_ICON: Record<CollectionRunStatus, ReactNode> = {
  RUNNING: <Loader2 size={12} className="run-status-tag__spin" />,
  SUCCESS: <CheckCircle2 size={12} />,
  FAILED: <AlertTriangle size={12} />,
  CANCELLED: <Ban size={12} />,
};

interface RunStatusTagProps {
  status: CollectionRunStatus;
  size?: 'default' | 'large';
}

export function RunStatusTag({ status, size = 'default' }: RunStatusTagProps) {
  return (
    <Tag
      color={STATUS_TONE[status]}
      bordered={false}
      className={`run-status-tag${size === 'large' ? ' run-status-tag--lg' : ''}`}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {STATUS_ICON[status]}
        {STATUS_LABEL[status]}
      </span>
    </Tag>
  );
}
