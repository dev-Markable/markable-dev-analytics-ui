import { Card, Col, Row, Typography } from 'antd';
import { Activity, Clock } from 'lucide-react';
import type { Commit } from '@/entities/commit';
import type { DateRange } from '@/shared/lib';
import { EmptyState } from '@/shared/ui';
import { ActivityByDayChart } from './ActivityByDayChart';
import { ActivityByHourChart } from './ActivityByHourChart';

interface ProfileActivityProps {
  commits: readonly Commit[];
  range: DateRange;
}

export function ProfileActivity({ commits, range }: ProfileActivityProps) {
  const hasCommits = commits.length > 0;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={16}>
        <Card variant="borderless" className="leaderboard-card">
          <header className="leaderboard-card__header">
            <div className="leaderboard-card__title">
              <span className="leaderboard-card__icon">
                <Activity size={16} />
              </span>
              <Typography.Title level={4} className="leaderboard-card__title-text">
                Активность по дням
              </Typography.Title>
            </div>
            <Typography.Text type="secondary" className="leaderboard-card__description">
              Коммиты (область) и добавленные строки (линия)
            </Typography.Text>
          </header>
          <div className="leaderboard-card__body">
            {hasCommits ? (
              <ActivityByDayChart commits={commits} range={range} />
            ) : (
              <EmptyState
                title="Нет коммитов"
                description="За выбранный период коммитов не зафиксировано."
              />
            )}
          </div>
        </Card>
      </Col>

      <Col xs={24} xl={8}>
        <Card variant="borderless" className="leaderboard-card">
          <header className="leaderboard-card__header">
            <div className="leaderboard-card__title">
              <span className="leaderboard-card__icon">
                <Clock size={16} />
              </span>
              <Typography.Title level={4} className="leaderboard-card__title-text">
                По часам суток
              </Typography.Title>
            </div>
            <Typography.Text type="secondary" className="leaderboard-card__description">
              Распределение коммитов
            </Typography.Text>
          </header>
          <div className="leaderboard-card__body">
            {hasCommits ? (
              <ActivityByHourChart commits={commits} />
            ) : (
              <EmptyState title="Нет данных" />
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
