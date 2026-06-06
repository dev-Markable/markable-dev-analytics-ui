import { Button, Layout, Tooltip, Typography } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSidebarStore } from '@/features/sidebar';
import { PRIMARY_NAV, SECONDARY_NAV } from '../config/nav-items';
import { Brand } from './Brand';
import { NavItem } from './NavItem';

const { Sider } = Layout;

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '12px 12px 4px',
  fontWeight: 600,
};

export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);

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

      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: collapsed ? '8px 8px' : '8px 12px',
          gap: 2,
          flex: 1,
        }}
      >
        {!collapsed && (
          <Typography.Text type="secondary" style={sectionLabelStyle}>
            Аналитика
          </Typography.Text>
        )}
        {PRIMARY_NAV.map((item) => (
          <NavItem key={item.key} item={item} collapsed={collapsed} />
        ))}

        {!collapsed ? (
          <Typography.Text
            type="secondary"
            style={{ ...sectionLabelStyle, padding: '16px 12px 4px' }}
          >
            Управление
          </Typography.Text>
        ) : (
          <div className="app-sider__nav-divider" />
        )}
        {SECONDARY_NAV.map((item) => (
          <NavItem key={item.key} item={item} collapsed={collapsed} />
        ))}
      </nav>

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
