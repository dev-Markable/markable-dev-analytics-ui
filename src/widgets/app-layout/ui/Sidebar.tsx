import { useMemo } from 'react';
import { Button, Layout, Tooltip } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSidebarStore } from '@/features/sidebar';
import { isElevated, useCurrentUser } from '@/entities/auth';
import { PRIMARY_NAV, type NavItem as NavItemType } from '../config/nav-items';
import { Brand } from './Brand';
import { NavItem } from './NavItem';
import { UserMenu } from './UserMenu';

const { Sider } = Layout;

export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);

  // RBAC (ADR-13): пункты с requiresElevated видны только ADMIN/TEAMLEAD.
  const { data: user } = useCurrentUser();
  const elevated = user ? isElevated(user.role) : false;
  const visible = useMemo(
    () => (items: readonly NavItemType[]) =>
      items.filter((i) => !i.requiresElevated || elevated),
    [elevated],
  );

  return (
    <Sider
      className="app-sider"
      collapsed={collapsed}
      width={240}
      collapsedWidth={72}
      theme="light"
      breakpoint="lg"
      trigger={null}
    >
      <Brand collapsed={collapsed} />

      {/* Заголовка группы нет: раздел в сайдбаре один (служебное — в меню профиля),
          и подпись «Аналитика» только добавляла шум над очевидным списком. */}
      <nav className={`app-sider__nav${collapsed ? ' app-sider__nav--collapsed' : ''}`}>
        {visible(PRIMARY_NAV).map((item) => (
          <NavItem key={item.key} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Профиль внизу сайдбара: в топбаре он оставался единственным элементом
          справа и выглядел потерянным. */}
      <div className="app-sider__user">
        <UserMenu collapsed={collapsed} />
      </div>

      <div
        className="app-sider__collapse-bar"
        style={{ justifyContent: collapsed ? 'center' : 'flex-end' }}
      >
        <Tooltip title={collapsed ? 'Развернуть' : 'Свернуть'} placement="right">
          <Button
            type="text"
            size="small"
            onClick={toggle}
            icon={collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            aria-label={collapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
          />
        </Tooltip>
      </div>
    </Sider>
  );
}
