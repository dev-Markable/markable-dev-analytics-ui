import type { ReactNode } from 'react';
import { Button, Typography } from 'antd';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  title = 'Нет данных',
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="state-block">
      <div className="state-block__icon state-block__icon--muted">
        {icon ?? <Inbox size={28} strokeWidth={1.5} />}
      </div>
      <Typography.Title level={4} className="state-block__title">
        {title}
      </Typography.Title>
      {description && (
        <Typography.Text type="secondary" className="state-block__description">
          {description}
        </Typography.Text>
      )}
      {action && (
        <Button onClick={action.onClick} className="state-block__action">
          {action.label}
        </Button>
      )}
    </div>
  );
}
