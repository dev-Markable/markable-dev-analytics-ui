import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  return (
    <Layout className="app-layout" hasSider>
      <Sidebar />
      <Layout>
        <Topbar />
        <Layout.Content>
          <div className="app-content">
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
