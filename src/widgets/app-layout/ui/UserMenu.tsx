import { Avatar, Dropdown, type MenuProps, Typography } from 'antd';
import { LogOut, SquareUser, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout, type Role } from '@/entities/auth';
import { ROUTES, buildProfilePath } from '@/app/router/paths';

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Администратор',
  TEAMLEAD: 'Тимлид',
  MEMBER: 'Разработчик',
};

export function UserMenu() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = (): void => {
    logout.mutate(undefined, {
      onSettled: () => navigate(ROUTES.login, { replace: true }),
    });
  };

  const items: MenuProps['items'] = [
    {
      key: 'who',
      disabled: true,
      label: (
        <div style={{ lineHeight: 1.3 }}>
          <div>{user.name ?? user.email}</div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {ROLE_LABEL[user.role]}
            {user.team ? ` · ${user.team}` : ''}
          </Typography.Text>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <SquareUser size={14} />,
      label: 'Перейти в профиль',
      onClick: () => navigate(buildProfilePath(user.email)),
    },
    { key: 'logout', icon: <LogOut size={14} />, label: 'Выйти', onClick: handleLogout },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <button type="button" className="user-menu" aria-label="Меню пользователя">
        <Avatar size={28} src={user.avatarUrl ?? undefined} icon={<UserRound size={16} />} />
        <span className="user-menu__name">{user.name ?? user.email}</span>
      </button>
    </Dropdown>
  );
}
