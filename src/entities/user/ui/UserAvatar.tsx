import { useEffect, useState } from 'react';
import { Avatar } from 'antd';
import type { UnifiedUser } from '../model/types';
import { userInitials } from '../lib/initials';

interface UserAvatarProps {
  user: Pick<UnifiedUser, 'name' | 'username' | 'email' | 'avatarUrl'>;
  size?: number | 'small' | 'default' | 'large';
}

const initialsStyle = {
  background: 'linear-gradient(135deg, #5b6cff 0%, #7c8aff 100%)',
  color: '#fff',
  fontWeight: 600,
  letterSpacing: '-0.02em',
} as const;

const hasValidUrl = (url: string | null | undefined): url is string =>
  typeof url === 'string' && url.trim().length > 0;

export function UserAvatar({ user, size = 'default' }: UserAvatarProps) {
  const url = user.avatarUrl;
  const [errored, setErrored] = useState(!hasValidUrl(url));

  useEffect(() => {
    setErrored(!hasValidUrl(url));
  }, [url]);

  if (hasValidUrl(url) && !errored) {
    return (
      <Avatar
        src={url}
        size={size}
        alt={user.email}
        onError={() => {
          setErrored(true);
          return false;
        }}
      />
    );
  }

  return (
    <Avatar size={size} style={initialsStyle}>
      {userInitials(user)}
    </Avatar>
  );
}
