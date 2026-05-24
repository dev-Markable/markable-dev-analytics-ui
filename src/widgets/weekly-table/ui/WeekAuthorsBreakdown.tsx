import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import { buildProfilePath } from '@/app/router/paths';
import {
  UserAvatar,
  authorAsUser,
  userDisplayName,
  type AuthorActivity,
} from '@/entities/user';
import { formatLinesDelta, formatNumber } from '@/shared/lib';
import type { DateRange } from '@/shared/lib';

interface WeekAuthorsBreakdownProps {
  authors: readonly AuthorActivity[];
  range: DateRange;
}

export function WeekAuthorsBreakdown({ authors, range }: WeekAuthorsBreakdownProps) {
  if (authors.length === 0) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        Нет авторов в этой неделе.
      </Typography.Text>
    );
  }

  return (
    <div className="week-breakdown">
      {authors.map((a) => {
        const user = authorAsUser(a);
        return (
          <Link
            key={a.email}
            to={buildProfilePath(a.email, range)}
            className="week-breakdown__row"
          >
            <UserAvatar user={user} size={28} />
            <span className="week-breakdown__identity">
              <Typography.Text strong style={{ fontSize: 13 }}>
                {userDisplayName(user)}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {a.email}
              </Typography.Text>
            </span>
            <span className="week-breakdown__metric">
              <Typography.Text strong style={{ fontSize: 13 }}>
                {formatNumber(a.nonMergeCommits)}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {a.mergeCommits > 0 ? `+${a.mergeCommits} merge` : 'коммитов'}
              </Typography.Text>
            </span>
            <span className="week-breakdown__metric week-breakdown__metric--lines">
              <Typography.Text style={{ fontSize: 13 }}>
                {formatLinesDelta(a.addedLines, a.deletedLines)}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                строк
              </Typography.Text>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
