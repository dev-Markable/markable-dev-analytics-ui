import type { ReactNode } from 'react';
import { Typography } from 'antd';
import { AlertTriangle } from 'lucide-react';
import { RetryButton } from '../RetryButton';
import type { ApiError } from '@/shared/api';

interface ErrorStateProps {
  error: ApiError | Error | null;
  onRetry?: () => void | Promise<void>;
  title?: ReactNode;
}

export function ErrorState({
  error,
  onRetry,
  title = 'Не удалось загрузить данные',
}: ErrorStateProps) {
  const message = error?.message ?? 'Неизвестная ошибка';
  return (
    <div className="state-block">
      <div className="state-block__icon state-block__icon--danger">
        <AlertTriangle size={28} strokeWidth={1.5} />
      </div>
      <Typography.Title level={4} className="state-block__title">
        {title}
      </Typography.Title>
      <Typography.Text type="secondary" className="state-block__description">
        {message}
      </Typography.Text>
      {onRetry && (
        <div className="state-block__action">
          <RetryButton onRetry={onRetry} />
        </div>
      )}
    </div>
  );
}
