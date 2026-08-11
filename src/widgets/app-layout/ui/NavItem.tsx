import { NavLink, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import type { NavItem as NavItemModel } from '../config/nav-items';

interface NavItemProps {
  item: NavItemModel;
  collapsed?: boolean;
}

/**
 * Пункт навигации сайдбара.
 *
 * Стили — классами, а не inline: раньше состояния задавались объектами стилей, из-за
 * чего у пунктов не было ховера вообще (в inline-стилях `:hover` невыразим), а активный
 * пункт заливался серым «слэбом» цвета фона страницы.
 */
export function NavItem({ item, collapsed = false }: NavItemProps) {
  const Icon = item.icon;
  const location = useLocation();

  const isMatch = item.matchPaths?.some((p) => location.pathname.startsWith(p)) ?? false;

  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'app-nav-link',
          collapsed ? 'app-nav-link--collapsed' : '',
          isActive || isMatch ? 'app-nav-link--active' : '',
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      <Icon size={16} strokeWidth={2} className="app-nav-link__icon" />
      {!collapsed && <span className="app-nav-link__label">{item.label}</span>}
    </NavLink>
  );

  if (!collapsed) return link;
  return (
    <Tooltip title={item.label} placement="right" mouseEnterDelay={0.2}>
      {link}
    </Tooltip>
  );
}
