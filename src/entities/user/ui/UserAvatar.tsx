import { useEffect, useState } from 'react';
import { Avatar, Tooltip } from 'antd';
import { Crown } from 'lucide-react';
import type { UnifiedUser } from '../model/types';
import { userInitials } from '../lib/initials';

interface UserAvatarProps {
  user: Pick<UnifiedUser, 'name' | 'username' | 'email' | 'avatarUrl'>;
  size?: number | 'small' | 'default' | 'large';
  /** Если true — рисуем corona-бейдж в углу (значок лида команды). */
  isLead?: boolean;
}

const initialsStyle = {
  background: 'linear-gradient(135deg, #5b6cff 0%, #7c8aff 100%)',
  color: '#fff',
  fontWeight: 600,
  letterSpacing: '-0.02em',
} as const;

const hasValidUrl = (url: string | null | undefined): url is string =>
  typeof url === 'string' && url.trim().length > 0;

/** Размер бейджа лида (в px) для разных размеров аватара. */
function leadBadgeSize(size: UserAvatarProps['size']): number {
  if (typeof size === 'number') return Math.max(12, Math.round(size * 0.4));
  if (size === 'small') return 12;
  if (size === 'large') return 18;
  return 14;
}

function LeadBadge({ size }: { size: number }) {
  return (
    <Tooltip title="Лид команды">
      <span
        className="user-avatar__lead-badge"
        style={{
          width: size,
          height: size,
        }}
        aria-label="Лид команды"
      >
        <Crown size={Math.round(size * 0.65)} strokeWidth={2.5} />
      </span>
    </Tooltip>
  );
}

export function UserAvatar({ user, size = 'default', isLead = false }: UserAvatarProps) {
  const url = user.avatarUrl;
  const [errored, setErrored] = useState(!hasValidUrl(url));

  useEffect(() => {
    setErrored(!hasValidUrl(url));
  }, [url]);

  const avatar =
    hasValidUrl(url) && !errored ? (
      <Avatar
        src={url}
        size={size}
        alt={user.email}
        onError={() => {
          setErrored(true);
          return false;
        }}
      />
    ) : (
      <Avatar size={size} style={initialsStyle}>
        {userInitials(user)}
      </Avatar>
    );

  if (!isLead) return avatar;

  return (
    <span className="user-avatar">
      {avatar}
      <LeadBadge size={leadBadgeSize(size)} />
    </span>
  );
}
