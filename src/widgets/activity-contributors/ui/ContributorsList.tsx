import { useMemo } from 'react';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import type { DailyStat } from '@/entities/stats';
import { useTeamFilter } from '@/features/team-filter';
import { UserAvatar, userDisplayName } from '@/entities/user';
import { buildProfilePath } from '@/app/router/paths';
import { EmptyState } from '@/shared/ui';
import { formatLinesDelta, formatNumber, type DateRange } from '@/shared/lib';
import {
  aggregateByContributor,
  type AuthorEnrichment,
  type ContributorActivity,
} from '../lib/aggregate-contributors';

interface ContributorsListProps {
  daily: readonly DailyStat[];
  range: DateRange;
  /** email (lowercase) → displayName + avatarUrl из /dashboard. */
  enrichmentByEmail?: ReadonlyMap<string, AuthorEnrichment>;
  topN?: number;
}

function ContributorRow({
  rank,
  data,
  range,
}: {
  rank: number;
  data: ContributorActivity;
  range: DateRange;
}) {
  const user = {
    email: data.email,
    name: data.displayName,
    username: null,
    avatarUrl: data.avatarUrl,
  };
  return (
    <Link
      to={buildProfilePath(data.email, range)}
      className="leaderboard-row"
      aria-label={`Профиль ${data.email}`}
    >
      <span className="contributors-list__rank">{rank}</span>
      <span className="leaderboard-row__author">
        <UserAvatar user={user} size={32} />
        <span className="leaderboard-row__identity">
          <Typography.Text strong ellipsis className="leaderboard-row__name">
            {userDisplayName(user)}
          </Typography.Text>
          <Typography.Text type="secondary" ellipsis className="leaderboard-row__email">
            {data.email} · {data.activeDays} дн · {data.repos} репо
          </Typography.Text>
        </span>
      </span>
      <span className="leaderboard-row__metrics">
        <span className="leaderboard-row__metric">
          <Typography.Text strong className="leaderboard-row__metric-value">
            {formatNumber(data.nonMergeCommits)}
          </Typography.Text>
          <Typography.Text type="secondary" className="leaderboard-row__metric-label">
            {data.mergeCommits > 0 ? `коммитов · +${data.mergeCommits} merge` : 'коммитов'}
          </Typography.Text>
        </span>
        <span className="leaderboard-row__metric leaderboard-row__metric--lines">
          <Typography.Text className="leaderboard-row__metric-value">
            {formatLinesDelta(data.addedLines, data.deletedLines)}
          </Typography.Text>
          <Typography.Text type="secondary" className="leaderboard-row__metric-label">
            строк
          </Typography.Text>
        </span>
      </span>
    </Link>
  );
}

export function ContributorsList({
  daily,
  range,
  enrichmentByEmail,
  topN = 10,
}: ContributorsListProps) {
  const all = useMemo(
    () => aggregateByContributor(daily, enrichmentByEmail),
    [daily, enrichmentByEmail],
  );
  const teamFiltered = useTeamFilter<ContributorActivity>(all, (c) => c.email);
  const items = teamFiltered.slice(0, topN);

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Trophy size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Топ контрибьюторов
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Топ-{topN} по не-мердж коммитам за период
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {items.length === 0 ? (
          <EmptyState
            title="Нет авторов"
            description="За выбранный период активность не зафиксирована."
          />
        ) : (
          <div className="leaderboard">
            {items.map((c, i) => (
              <ContributorRow key={c.email} rank={i + 1} data={c} range={range} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
