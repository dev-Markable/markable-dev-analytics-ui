import type { ReactNode } from 'react';
import type { AsyncState } from '@/shared/api';
import type { AuthorActivity } from '@/entities/user';
import type { DateRange } from '@/shared/lib';
import { AsyncContent, EmptyState, SectionCard } from '@/shared/ui';
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
  return (
    <SectionCard title={title} icon={icon} description={description}>
      <AsyncContent
        status={status}
        isEmpty={items.length === 0}
        error={error}
        onRetry={onRetry}
        skeleton={<LeaderboardSkeleton />}
        empty={<EmptyState title={emptyTitle} description={emptyDescription} />}
      >
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
      </AsyncContent>
    </SectionCard>
  );
}
