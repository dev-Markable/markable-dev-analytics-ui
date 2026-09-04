import { useMemo } from 'react';
import { Layout, Tooltip } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSidebarStore } from '@/features/sidebar';
import { isElevated, useCurrentUser } from '@/entities/auth';
import { PRIMARY_NAV, type NavItem as NavItemType } from '../config/nav-items';
import { Brand } from './Brand';
import { NavItem } from './NavItem';
import { SidebarPulse } from './SidebarPulse';
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
      {/* Кнопка сворачивания — в строке бренда: это управление самим сайдбаром,
          а не пункт низа колонки. Внизу остаётся только футер с пользователем. */}
      <div className={`app-sider__brandbar${collapsed ? ' app-sider__brandbar--collapsed' : ''}`}>
        <Brand collapsed={collapsed} />
        <Tooltip title={collapsed ? 'Развернуть' : 'Свернуть'} placement="right">
          <button
            type="button"
            className="app-sider__collapse"
            onClick={toggle}
            aria-label={collapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <PanelLeftOpen size={15} strokeWidth={1.8} />
            ) : (
              <PanelLeftClose size={15} strokeWidth={1.8} />
            )}
          </button>
        </Tooltip>
      </div>
      {!collapsed && <SidebarPulse />}

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
    </Sider>
  );
}
