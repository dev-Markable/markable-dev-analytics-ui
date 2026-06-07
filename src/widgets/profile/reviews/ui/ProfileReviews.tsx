import { useMemo } from 'react';
import { Typography } from 'antd';
import { MessagesSquare } from 'lucide-react';
import type { ReviewStats } from '@/entities/stats';
import type { AsyncState } from '@/shared/api';
import { AsyncContent, EmptyState, LoadingState, SectionCard } from '@/shared/ui';
import { formatNumber } from '@/shared/lib';
import { formatHours } from '@/widgets/activity/reviews/lib/reviews';
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

  return (
    <SectionCard
      title="Ревью"
      icon={<MessagesSquare size={16} />}
      description={
        data
          ? `#${data.engagementRank} из ${data.activeReviewers} по вовлечённости · ср. время до merge ${formatHours(data.author.avgTimeToMergeHours)}`
          : 'Участие в ревью за период (GitLab MR)'
      }
    >
      <AsyncContent
        status={state.status}
        isEmpty={!data}
        hasData={Boolean(state.data)}
        // error-проп не передаём: на ошибке без данных профиль показывает empty,
        // а не отдельный ErrorState (как было до рефакторинга).
        skeleton={<LoadingState label="Загружаем ревью" />}
        empty={
          <EmptyState
            title="Нет ревью-активности"
            description="За выбранный период автор не участвовал в ревью (approve / комментарии)."
          />
        }
      >
        {data && (
          <div className="profile-reviews">
            <MetricRow label="Approve" hint="чужих MR одобрено" cmp={data.reviewsGiven} />
            <MetricRow label="Комментариев" hint="к чужим MR" cmp={data.commentsGiven} />
            <MetricRow label="Получено ревью" hint="его MR отревьюили" cmp={data.reviewsReceived} />
          </div>
        )}
      </AsyncContent>
    </SectionCard>
  );
}
