import { Card, Typography } from 'antd';
import { ExternalLink, Rocket } from 'lucide-react';
import type { DeliveredFeature } from '@/entities/performance-review';
import { formatNumber } from '@/shared/lib';
import { deliveryProgress } from '../lib/progress';

interface DeliveredFeaturesCardProps {
  items: DeliveredFeature[];
}

export function DeliveredFeaturesCard({ items }: DeliveredFeaturesCardProps) {
  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Rocket size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            🚀 Доставленные доработки
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Корневые задачи с завершёнными юскейсами — что довёл до релиза.
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {items.length === 0 ? (
          <Typography.Text type="secondary">
            За период не довёл фичи до релиза.
          </Typography.Text>
        ) : (
          <ul className="delivered-list">
            {items.map((feat) => {
              const progress = deliveryProgress(feat.doneCount, feat.totalCount);
              const pct = Math.round(progress * 100);
              const completed = feat.doneCount === feat.totalCount;

              const head = (
                <span className="delivered-list__head">
                  <span className="delivered-list__title">{feat.title}</span>
                  {feat.url && (
                    <ExternalLink size={13} className="delivered-list__icon" />
                  )}
                </span>
              );

              return (
                <li
                  key={feat.id}
                  className={`delivered-list__item${completed ? ' delivered-list__item--done' : ''}`}
                >
                  {feat.url ? (
                    <a
                      href={feat.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="delivered-list__link"
                    >
                      {head}
                    </a>
                  ) : (
                    head
                  )}

                  <div
                    className="delivered-list__bar"
                    role="img"
                    aria-label={`Закрыто ${feat.doneCount} из ${feat.totalCount}`}
                  >
                    <span
                      className="delivered-list__bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="delivered-list__meta">
                    <span>
                      <strong>{formatNumber(feat.doneCount)}</strong>
                      {' / '}
                      {formatNumber(feat.totalCount)} юскейсов
                    </span>
                    <span className="delivered-list__pct">{pct}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
