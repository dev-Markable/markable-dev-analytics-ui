import { NavLink, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import type { NavItem as NavItemModel } from '../config/nav-items';

interface NavItemProps {
  item: NavItemModel;
  collapsed?: boolean;
}

const baseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 12px',
  borderRadius: 8,
  color: 'var(--ant-color-text-secondary)',
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'background 120ms ease, color 120ms ease',
};

const collapsedStyle: React.CSSProperties = {
  ...baseStyle,
  justifyContent: 'center',
  gap: 0,
};

const activeStyle: React.CSSProperties = {
  background: 'var(--ant-color-bg-layout)',
  color: 'var(--ant-color-text)',
};

export function NavItem({ item, collapsed = false }: NavItemProps) {
  const Icon = item.icon;
  const location = useLocation();

  const isMatch =
    item.matchPaths?.some((p) => location.pathname.startsWith(p)) ?? false;

  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      aria-label={collapsed ? item.label : undefined}
      style={({ isActive }) => ({
        ...(collapsed ? collapsedStyle : baseStyle),
        ...(isActive || isMatch ? activeStyle : null),
      })}
    >
      <Icon size={16} strokeWidth={2} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );

  if (!collapsed) return link;
  return (
    <Tooltip title={item.label} placement="right" mouseEnterDelay={0.2}>
      {link}
    </Tooltip>
  );
}
