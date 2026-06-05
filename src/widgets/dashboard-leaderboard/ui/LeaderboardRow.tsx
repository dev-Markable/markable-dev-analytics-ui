import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import { buildProfilePath } from '@/app/router/paths';
import {
  ActivityBadge,
  UserAvatar,
  authorAsUser,
  userDisplayName,
  type AuthorActivity,
} from '@/entities/user';
import { TeamChip } from '@/entities/team';
import type { DateRange } from '@/shared/lib';
import { formatLinesDelta, formatNumber } from '@/shared/lib';
import { RankBadge } from './RankBadge';

interface LeaderboardRowProps {
  rank: number;
  data: AuthorActivity;
  range: DateRange;
  variant?: 'top' | 'outsider';
}

export function LeaderboardRow({ rank, data, range, variant }: LeaderboardRowProps) {
  const user = authorAsUser(data);
  const hasMerges = data.mergeCommits > 0;

  return (
    <Link
      to={buildProfilePath(data.email, range)}
      className="leaderboard-row"
      aria-label={`Профиль ${data.email}`}
    >
      <RankBadge rank={rank} variant={variant} />

      <span className="leaderboard-row__author">
        <UserAvatar user={user} size={32} isLead={data.isLead} />
        <span className="leaderboard-row__identity">
          <span className="leaderboard-row__name-line">
            <Typography.Text strong ellipsis className="leaderboard-row__name">
              {userDisplayName(user)}
            </Typography.Text>
            {data.activity && <ActivityBadge activity={data.activity} compact />}
          </span>
          <span className="leaderboard-row__sub-line">
            <Typography.Text type="secondary" ellipsis className="leaderboard-row__email">
              {data.email}
            </Typography.Text>
            <TeamChip team={data.team} compact />
          </span>
        </span>
      </span>

      <span className="leaderboard-row__metrics">
        <span className="leaderboard-row__metric">
          <Typography.Text strong className="leaderboard-row__metric-value">
            {formatNumber(data.nonMergeCommits)}
          </Typography.Text>
          <Typography.Text type="secondary" className="leaderboard-row__metric-label">
            {hasMerges ? `коммитов · +${data.mergeCommits} merge` : 'коммитов'}
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
