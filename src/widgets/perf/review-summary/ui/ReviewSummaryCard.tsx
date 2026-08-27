import { MessagesSquare } from "lucide-react";
import type { PerformanceMetrics } from "@/entities/performance-review";
import { formatHours, formatNumber } from "@/shared/lib";
import { RatioBar, SectionCard, StatTile } from "@/shared/ui";
import { toTileDelta } from "@/widgets/perf/shared";
import { engagement } from "../lib/engagement";

interface ReviewSummaryCardProps {
  metrics: PerformanceMetrics;
}

export function ReviewSummaryCard({ metrics }: ReviewSummaryCardProps) {
  const reviewsGiven = metrics.reviewsGiven.current;
  const commentsGiven = metrics.commentsGiven.current;
  const reviewsReceived = metrics.reviewsReceived.current;
  const givenSum = engagement(reviewsGiven, commentsGiven);

  return (
    <SectionCard
      title="Ревью"
      icon={<MessagesSquare size={16} />}
      description="Время до merge, объём своих MR и вовлечённость в чужие"
    >
      <div className="perf-card">
        <div className="perf-card__tiles">
          <StatTile
            variant="inset"
            size="lg"
            value={formatHours(metrics.avgTimeToMergeHours.current)}
            label="ср. время до merge"
            hint={`смержено MR: ${formatNumber(metrics.mergedMrCount.current)}`}
            // Рост времени до merge — плохая новость, хотя стрелка смотрит вверх.
            delta={toTileDelta(metrics.avgTimeToMergeHours, {
              lowerIsBetter: true,
            })}
          />
          <StatTile
            variant="inset"
            size="lg"
            value={formatNumber(reviewsGiven)}
            label="approve чужих MR"
            hint={`комментариев: ${formatNumber(commentsGiven)}`}
            delta={toTileDelta(metrics.reviewsGiven)}
          />
        </div>

        <RatioBar
          caption="Даёт ревью vs получает"
          segments={[
            { key: "given", label: "Даёт", value: givenSum, tone: "primary" },
            {
              key: "received",
              label: "Получает",
              value: reviewsReceived,
              tone: "muted",
            },
          ]}
          emptyText="За период не участвовал в ревью"
        />

        <p className="perf-card__note">
          Вовлечённость = approve + комментарии к чужим MR
        </p>
      </div>
    </SectionCard>
  );
}
