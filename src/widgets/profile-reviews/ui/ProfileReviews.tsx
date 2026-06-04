import { useMemo } from 'react';
import { Card, Typography } from 'antd';
import { MessagesSquare } from 'lucide-react';
import type { ReviewStats } from '@/entities/stats';
import type { AsyncState } from '@/shared/api';
import { EmptyState, LoadingState } from '@/shared/ui';
import { formatNumber } from '@/shared/lib';
import { formatHours } from '@/widgets/activity-reviews/lib/reviews';
import { buildProfileReviewStats, type ReviewMetricComparison } from '../lib/compare';
import { StandingBadge } from './StandingBadge';

interface ProfileReviewsProps {
  state: AsyncState<ReviewStats>;
  email: string;
}

function MetricRow({
  label,
  hint,
  cmp,
}: {
  label: string;
  hint: string;
  cmp: ReviewMetricComparison;
}) {
  return (
    <div className="profile-reviews__metric">
      <div className="profile-reviews__metric-head">
        <Typography.Text className="profile-reviews__metric-value">
          {formatNumber(cmp.value)}
        </Typography.Text>
        <Typography.Text type="secondary" className="profile-reviews__metric-label">
          {label}
        </Typography.Text>
      </div>
      <Typography.Text type="secondary" className="profile-reviews__metric-hint">
        {hint}
      </Typography.Text>
      <StandingBadge standing={cmp.standing} teamAvg={cmp.teamAvg} />
    </div>
  );
}

export function ProfileReviews({ state, email }: ProfileReviewsProps) {
  const data = useMemo(() => buildProfileReviewStats(state.data, email), [state.data, email]);

  const isLoading = state.status === 'loading' && !state.data;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <MessagesSquare size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Ревью
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {data
            ? `#${data.engagementRank} из ${data.activeReviewers} по вовлечённости · ср. время до merge ${formatHours(data.author.avgTimeToMergeHours)}`
            : 'Участие в ревью за период (GitLab MR)'}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {isLoading ? (
          <LoadingState label="Загружаем ревью" />
        ) : !data ? (
          <EmptyState
            title="Нет ревью-активности"
            description="За выбранный период автор не участвовал в ревью (approve / комментарии)."
          />
        ) : (
          <div className="profile-reviews">
            <MetricRow label="Approve" hint="чужих MR одобрено" cmp={data.reviewsGiven} />
            <MetricRow
              label="Комментариев"
              hint="к чужим MR"
              cmp={data.commentsGiven}
            />
            <MetricRow
              label="Получено ревью"
              hint="его MR отревьюили"
              cmp={data.reviewsReceived}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
