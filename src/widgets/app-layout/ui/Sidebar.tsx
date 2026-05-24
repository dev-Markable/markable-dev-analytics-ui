import { Layout, Typography } from 'antd';
import { APP_SHORT_NAME } from '@/shared/config';
import { PRIMARY_NAV, SECONDARY_NAV } from '../config/nav-items';
import { NavItem } from './NavItem';

const { Sider } = Layout;

export function Sidebar() {
  return (
    <Sider
      className="app-sider"
      width={240}
      theme="light"
      breakpoint="lg"
      collapsedWidth={64}
    >
      <div className="app-sidebar-brand">
        <span className="app-sidebar-brand__dot" aria-hidden />
        <span>{APP_SHORT_NAME}</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px', gap: 2 }}>
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '12px 12px 4px',
            fontWeight: 600,
          }}
        >
          Аналитика
        </Typography.Text>
        {PRIMARY_NAV.map((item) => (
          <NavItem key={item.key} item={item} />
        ))}

        <Typography.Text
          type="secondary"
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '16px 12px 4px',
            fontWeight: 600,
          }}
        >
          Управление
        </Typography.Text>
        {SECONDARY_NAV.map((item) => (
          <NavItem key={item.key} item={item} />
        ))}
      </nav>
    </Sider>
  );
}
