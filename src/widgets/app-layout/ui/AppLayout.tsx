import { Suspense } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { LoadingState } from '@/shared/ui';
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
            {/* Suspense вокруг Outlet — каркас (сайдбар/топбар) не мигает,
                пока грузится lazy-чанк страницы. */}
            <Suspense fallback={<LoadingState fullPage label="Загрузка…" />}>
              <Outlet />
            </Suspense>
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
