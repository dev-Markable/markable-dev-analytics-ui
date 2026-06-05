import { Card, Tag, Typography } from 'antd';
import { ExternalLink, GitMerge, Trophy } from 'lucide-react';
import type { PerformanceHighlight } from '@/entities/performance-review';

interface PerfHighlightsProps {
  highlights: PerformanceHighlight[];
}

const KIND_META: Record<PerformanceHighlight['kind'], { label: string; color: string }> = {
  CARD: { label: 'Kaiten', color: 'geekblue' },
  MR: { label: 'MR', color: 'purple' },
};

export function PerfHighlights({ highlights }: PerfHighlightsProps) {
  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Trophy size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Заметные результаты
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Ключевые карточки и merge request за период
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {highlights.length === 0 ? (
          <Typography.Text type="secondary">За период нет заметных результатов.</Typography.Text>
        ) : (
          <ul className="perf-highlights">
            {highlights.map((h) => {
              const meta = KIND_META[h.kind];
              return (
                <li key={h.url} className="perf-highlights__item">
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="perf-highlights__link"
                  >
                    <span className="perf-highlights__icon">
                      {h.kind === 'MR' ? <GitMerge size={16} /> : <ExternalLink size={16} />}
                    </span>
                    <span className="perf-highlights__text">
                      <span className="perf-highlights__title">{h.title}</span>
                      {h.subtitle && (
                        <Typography.Text type="secondary" className="perf-highlights__subtitle">
                          {h.subtitle}
                        </Typography.Text>
                      )}
                    </span>
                    <Tag color={meta.color} className="perf-highlights__tag">
                      {meta.label}
                    </Tag>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
