import { NavLink, useLocation } from 'react-router-dom';
import type { NavItem as NavItemModel } from '../config/nav-items';

interface NavItemProps {
  item: NavItemModel;
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

const activeStyle: React.CSSProperties = {
  background: 'var(--ant-color-bg-layout)',
  color: 'var(--ant-color-text)',
};

export function NavItem({ item }: NavItemProps) {
  const Icon = item.icon;
  const location = useLocation();

  const isMatch =
    item.matchPaths?.some((p) => location.pathname.startsWith(p)) ?? false;

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      style={({ isActive }) => ({
        ...baseStyle,
        ...(isActive || isMatch ? activeStyle : null),
      })}
    >
      <Icon size={16} strokeWidth={2} />
      <span>{item.label}</span>
    </NavLink>
  );
}
