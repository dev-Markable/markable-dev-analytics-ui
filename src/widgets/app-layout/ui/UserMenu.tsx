import { Avatar, Dropdown, type MenuProps, Tooltip, Typography } from 'antd';
import { ChevronsUpDown, LogOut, RefreshCcw, Settings, SquareUser, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout, type Role } from '@/entities/auth';
import { ROUTES, buildProfilePath } from '@/app/router/paths';

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Администратор',
  TEAMLEAD: 'Тимлид',
  MEMBER: 'Разработчик',
};

interface UserMenuProps {
  /** Сайдбар свёрнут — показываем только аватар. */
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
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
    { type: 'divider' },
    // Служебные разделы переехали сюда из сайдбара: они нужны редко, а место
    // в основной навигации занимали наравне с аналитикой.
    {
      key: 'collection',
      icon: <RefreshCcw size={14} />,
      label: 'Сбор данных',
      onClick: () => navigate(ROUTES.collection),
    },
    {
      key: 'settings',
      icon: <Settings size={14} />,
      label: 'Настройки',
      onClick: () => navigate(ROUTES.settings),
    },
    { type: 'divider' },
    { key: 'logout', icon: <LogOut size={14} />, label: 'Выйти', onClick: handleLogout },
  ];

  const trigger = (
    <button
      type="button"
      className={`user-menu${collapsed ? ' user-menu--collapsed' : ''}`}
      aria-label="Меню пользователя"
    >
      <Avatar
        size={collapsed ? 30 : 34}
        src={user.avatarUrl ?? undefined}
        icon={<UserRound size={16} />}
      />
      {!collapsed && (
        <>
          <span className="user-menu__ident">
            <span className="user-menu__name">{user.name ?? user.email}</span>
            <span className="user-menu__role">{ROLE_LABEL[user.role]}</span>
          </span>
          <ChevronsUpDown size={14} className="user-menu__chevron" />
        </>
      )}
    </button>
  );

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      /* Меню открывается вверх: кнопка стоит в самом низу сайдбара. */
      placement="topLeft"
      arrow={false}
    >
      {collapsed ? (
        <span>
          <Tooltip title={user.name ?? user.email} placement="right">
            {trigger}
          </Tooltip>
        </span>
      ) : (
        trigger
      )}
    </Dropdown>
  );
}
