import { Suspense } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSplash, ErrorBoundary } from '@/shared/ui';
import { CommandPalette } from '@/features/command-palette';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <Layout className="app-layout" hasSider>
      <CommandPalette />
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
              <Suspense fallback={<AppSplash />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
