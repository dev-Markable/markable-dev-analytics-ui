import { Card, Tag, Typography } from 'antd';
import { Crown, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAvatar, userDisplayName } from '@/entities/user';
import type { PerformanceReview } from '@/entities/performance-review';
import { buildProfilePath } from '@/app/router/paths';
import { formatRange } from '@/shared/lib';

interface PerfSubjectProps {
  review: PerformanceReview;
}

export function PerfSubject({ review }: PerfSubjectProps) {
  const { subject, period, comparedTo } = review;

  return (
    <Card variant="borderless" className="perf-subject">
      <div className="perf-subject__main">
        <UserAvatar user={subject} size={64} isLead={subject.isLead} />
        <div className="perf-subject__meta">
          <Typography.Title level={3} className="perf-subject__name">
            {userDisplayName(subject)}
          </Typography.Title>
          <div className="perf-subject__sub">
            <Typography.Text type="secondary">{subject.email}</Typography.Text>
            {subject.team && subject.isLead && (
              <Tag color="gold" icon={<Crown size={12} />}>
                Лид команды «{subject.team}»
              </Tag>
            )}
            {subject.team && !subject.isLead && (
              <Tag color="blue" icon={<Users size={12} />}>
                {subject.team}
              </Tag>
            )}
          </div>
        </div>
      </div>

      <div className="perf-subject__period">
        <Typography.Text type="secondary" className="perf-subject__period-label">
          Период
        </Typography.Text>
        <Typography.Text strong>{formatRange(period.from, period.to)}</Typography.Text>
        {comparedTo && (
          <Typography.Text type="secondary" className="perf-subject__compare">
            сравнение с {formatRange(comparedTo.from, comparedTo.to)}
          </Typography.Text>
        )}
        <Link to={buildProfilePath(subject.email)} className="perf-subject__profile-link">
          Открыть профиль →
        </Link>
      </div>
    </Card>
  );
}
