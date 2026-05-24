import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import { buildProfilePath } from '@/app/router/paths';
import type { UnifiedUser } from '../model/types';
import { UserAvatar } from './UserAvatar';
import { userDisplayName } from '../lib/initials';

interface UserChipProps {
  user: Pick<UnifiedUser, 'email' | 'name' | 'username' | 'avatarUrl'>;
  link?: boolean;
  subText?: string;
  range?: { from: string; to: string } | null;
}

export function UserChip({ user, link = true, subText, range = null }: UserChipProps) {
  const name = userDisplayName(user);
  const body = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <UserAvatar user={user} size={28} />
      <span style={{ display: 'inline-flex', flexDirection: 'column', minWidth: 0 }}>
        <Typography.Text strong ellipsis style={{ fontSize: 14 }}>
          {name}
        </Typography.Text>
        <Typography.Text type="secondary" ellipsis style={{ fontSize: 12 }}>
          {subText ?? user.email}
        </Typography.Text>
      </span>
    </span>
  );

  if (!link) return body;
  return (
    <Link to={buildProfilePath(user.email, range)} style={{ color: 'inherit' }}>
      {body}
    </Link>
  );
}
