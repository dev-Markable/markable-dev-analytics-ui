import { Suspense } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary, LoadingState } from '@/shared/ui';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <Layout className="app-layout" hasSider>
      <Sidebar />
      <Layout>
        <Topbar />
        <Layout.Content>
          <div className="app-content">
            {/*
              ErrorBoundary внутри каркаса: упавшая страница не уносит
              сайдбар/топбар. resetKey=pathname — переход на другой роут
              автоматически даёт «свежее» дерево.

              Suspense ниже ErrorBoundary, чтобы ошибки lazy-загрузки тоже
              ловились (чанк не загрузился → boundary покажет fallback).
            */}
            <ErrorBoundary resetKey={pathname}>
              <Suspense fallback={<LoadingState fullPage label="Загрузка…" />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
