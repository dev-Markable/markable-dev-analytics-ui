import { Card, Space, Tag, Typography } from 'antd';
import { AtSign, Hash } from 'lucide-react';
import {
  UserAvatar,
  userDisplayName,
  type UnifiedUser,
} from '@/entities/user';

interface ProfileHeaderProps {
  user: UnifiedUser;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const name = userDisplayName(user);

  return (
    <Card variant="borderless" className="profile-header">
      <div className="profile-header__main">
        <UserAvatar user={user} size={72} />
        <div className="profile-header__identity">
          <Typography.Title level={2} className="profile-header__name">
            {name}
          </Typography.Title>
          <Typography.Text type="secondary" className="profile-header__email">
            {user.email}
          </Typography.Text>
          <Space size={6} wrap className="profile-header__badges">
            {user.username && (
              <Tag bordered={false} icon={<AtSign size={12} />}>
                {user.username}
              </Tag>
            )}
            {user.kaitenId != null && (
              <Tag bordered={false} icon={<Hash size={12} />} color="processing">
                Kaiten #{user.kaitenId}
              </Tag>
            )}
            {user.gitlabId != null && (
              <Tag bordered={false} icon={<Hash size={12} />} color="warning">
                GitLab #{user.gitlabId}
              </Tag>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
}
