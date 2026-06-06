import { Card, Tooltip, Typography } from 'antd';
import { MessagesSquare } from 'lucide-react';
import type { PerformanceMetrics } from '@/entities/performance-review';
import { formatNumber } from '@/shared/lib';
import { PerfMetricTile } from '@/widgets/perf-metric-tile';
import { engagement, givenShare } from '../lib/engagement';

interface ReviewSummaryCardProps {
  metrics: PerformanceMetrics;
}

function formatSharePct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function ReviewSummaryCard({ metrics }: ReviewSummaryCardProps) {
  const reviewsGiven = metrics.reviewsGiven.current;
  const commentsGiven = metrics.commentsGiven.current;
  const reviewsReceived = metrics.reviewsReceived.current;
  const givenSum = engagement(reviewsGiven, commentsGiven);
  const share = givenShare(givenSum, reviewsReceived);

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
          Время до merge, объём своих MR и вовлечённость в чужие.
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="perf-pair">
          <PerfMetricTile
            label="Ср. время до merge"
            metric={metrics.avgTimeToMergeHours}
            size="lg"
            accent="primary"
            hours
            lowerIsBetter
            hint={`смержено MR: ${formatNumber(metrics.mergedMrCount.current)}`}
          />
          <PerfMetricTile
            label="Ревью (approve)"
            metric={metrics.reviewsGiven}
            size="lg"
            hint={`комментариев: ${formatNumber(commentsGiven)}`}
          />
        </div>

        {share != null ? (
          <div className="review-summary__split">
            <Typography.Text type="secondary" className="review-summary__split-label">
              Даёт ревью vs получает
            </Typography.Text>
            <div className="review-summary__bar" role="img" aria-label="Даёт vs получает">
              {share > 0 && (
                <Tooltip
                  title={`Даёт: approve ${formatNumber(reviewsGiven)} + комментариев ${formatNumber(commentsGiven)} = ${formatNumber(givenSum)}`}
                >
                  <span
                    className="review-summary__seg review-summary__seg--given"
                    style={{ width: `${share * 100}%` }}
                  >
                    {share >= 0.12 && `Даёт ${formatSharePct(share)}`}
                  </span>
                </Tooltip>
              )}
              {share < 1 && (
                <Tooltip title={`Получает ревью: ${formatNumber(reviewsReceived)}`}>
                  <span
                    className="review-summary__seg review-summary__seg--received"
                    style={{ width: `${(1 - share) * 100}%` }}
                  >
                    {1 - share >= 0.12 && `Получает ${formatSharePct(1 - share)}`}
                  </span>
                </Tooltip>
              )}
            </div>
            <Typography.Text type="secondary" className="review-summary__split-hint">
              Engagement = approve + комментарии к чужим MR
            </Typography.Text>
          </div>
        ) : (
          <Typography.Text type="secondary" className="review-summary__empty">
            Ревью-активности за период нет.
          </Typography.Text>
        )}
      </div>
    </Card>
  );
}
