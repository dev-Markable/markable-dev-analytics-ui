import { Card, Typography } from 'antd';
import { ExternalLink, Flame } from 'lucide-react';
import type { FirefightingItem } from '@/entities/performance-review';
import { URGENCY_META } from '../config/urgency-meta';

interface FirefightingCardProps {
  items: FirefightingItem[];
}

export function FirefightingCard({ items }: FirefightingCardProps) {
  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Flame size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            🔥 Тушение пожаров
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Закрытые критичные и высокие дефекты — пруфы, что фиксил «горящее».
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {items.length === 0 ? (
          <Typography.Text type="secondary">
            За период критичных/высоких дефектов не закрывал.
          </Typography.Text>
        ) : (
          <ul className="notable-list">
            {items.map((item) => {
              const meta = URGENCY_META[item.urgency];
              const content = (
                <>
                  <span
                    className="notable-list__urgency"
                    style={{ background: meta.color }}
                    title={`Срочность: ${meta.label}`}
                  >
                    {meta.label}
                  </span>
                  <span className="notable-list__text">
                    <span className="notable-list__title">{item.title}</span>
                    <Typography.Text type="secondary" className="notable-list__sub">
                      #{item.id}
                    </Typography.Text>
                  </span>
                  {item.url && (
                    <ExternalLink size={14} className="notable-list__icon" />
                  )}
                </>
              );

              return (
                <li key={item.id} className="notable-list__item">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="notable-list__link"
                    >
                      {content}
                    </a>
                  ) : (
                    <span className="notable-list__link notable-list__link--inert">
                      {content}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
