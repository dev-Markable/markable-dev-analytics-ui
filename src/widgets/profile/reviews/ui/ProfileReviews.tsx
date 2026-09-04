import { useMemo } from "react";
import { MessagesSquare } from "lucide-react";
import type { ReviewStats } from "@/entities/stats";
import type { AsyncState } from "@/shared/api";
import {
  AsyncContent,
  EmptyState,
  LoadingState,
  SectionCard,
  StatTile,
} from "@/shared/ui";
import { formatNumber } from "@/shared/lib";
import { formatHours } from "@/widgets/activity/reviews/lib/reviews";
import {
  buildProfileReviewStats,
  type ReviewMetricComparison,
} from "../lib/compare";

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
    <StatTile
      variant="inset"
      value={formatNumber(cmp.value)}
      label={label}
      hint={hint}
      comparison={{
        standing: cmp.standing,
        avgLabel: formatNumber(Math.round(cmp.teamAvg)),
      }}
    />
  );
}

export function ProfileReviews({ state, email }: ProfileReviewsProps) {
  const data = useMemo(
    () => buildProfileReviewStats(state.data, email),
    [state.data, email],
  );

  return (
    <SectionCard
      title="Участие в ревью"
      icon={<MessagesSquare size={16} />}
      description={
        data
          ? `#${data.engagementRank} из ${data.activeReviewers} по вовлечённости · ср. время до merge ${formatHours(data.author.avgTimeToMergeHours)}`
          : "Участие в ревью за период (GitLab MR)"
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
            <MetricRow
              label="Approve"
              hint="чужих MR одобрено"
              cmp={data.reviewsGiven}
            />
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
      </AsyncContent>
    </SectionCard>
  );
}
