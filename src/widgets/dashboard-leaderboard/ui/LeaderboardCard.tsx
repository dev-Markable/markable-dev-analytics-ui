import type { ReactNode } from 'react';
import { Card, Typography } from 'antd';
import type { AsyncState } from '@/shared/api';
import type { AuthorActivity } from '@/entities/user';
import type { DateRange } from '@/shared/lib';
import { EmptyState, ErrorState } from '@/shared/ui';
import { LeaderboardRow } from './LeaderboardRow';
import { LeaderboardSkeleton } from './LeaderboardSkeleton';

interface LeaderboardCardProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  items: readonly AuthorActivity[];
  status: AsyncState<unknown>['status'];
  error?: AsyncState<unknown>['error'];
  onRetry?: () => void;
  variant?: 'top' | 'outsider';
  range: DateRange;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function LeaderboardCard({
  title,
  description,
  icon,
  items,
  status,
  error,
  onRetry,
  variant = 'top',
  range,
  emptyTitle = 'Нет данных',
  emptyDescription = 'За выбранный период активность не зафиксирована.',
}: LeaderboardCardProps) {
  const isInitialLoading = status === 'loading' && items.length === 0;
  const isError = status === 'error' && items.length === 0;
  const isEmpty = status === 'success' && items.length === 0;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          {icon && <span className="leaderboard-card__icon">{icon}</span>}
          <Typography.Title level={4} className="leaderboard-card__title-text">
            {title}
          </Typography.Title>
        </div>
        {description && (
          <Typography.Text type="secondary" className="leaderboard-card__description">
            {description}
          </Typography.Text>
        )}
      </header>

      <div className="leaderboard-card__body">
        {isInitialLoading && <LeaderboardSkeleton />}
        {isError && <ErrorState error={error ?? null} onRetry={onRetry} />}
        {isEmpty && <EmptyState title={emptyTitle} description={emptyDescription} />}
        {!isInitialLoading && !isError && !isEmpty && items.length > 0 && (
          <div className="leaderboard">
            {items.map((row, index) => (
              <LeaderboardRow
                key={row.email}
                rank={index + 1}
                data={row}
                range={range}
                variant={variant}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
