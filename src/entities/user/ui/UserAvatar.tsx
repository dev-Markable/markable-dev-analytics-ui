import { Avatar } from 'antd';
import type { UnifiedUser } from '../model/types';
import { userInitials } from '../lib/initials';

interface UserAvatarProps {
  user: Pick<UnifiedUser, 'name' | 'username' | 'email' | 'avatarUrl'>;
  size?: number | 'small' | 'default' | 'large';
}

export function UserAvatar({ user, size = 'default' }: UserAvatarProps) {
  if (user.avatarUrl) {
    return <Avatar src={user.avatarUrl} size={size} alt={user.email} />;
  }
  return (
    <Avatar
      size={size}
      style={{
        background: 'linear-gradient(135deg, #5b6cff 0%, #7c8aff 100%)',
        color: '#fff',
        fontWeight: 600,
        letterSpacing: '-0.02em',
      }}
    >
      {userInitials(user)}
    </Avatar>
  );
}
