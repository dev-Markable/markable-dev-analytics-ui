import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { getThemeConfig, type ThemeMode } from '@/shared/lib';

interface AntdProviderProps {
  mode: ThemeMode;
  children: ReactNode;
}

export function AntdProvider({ mode, children }: AntdProviderProps) {
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  return (
    <ConfigProvider
      theme={getThemeConfig(mode)}
      locale={ruRU}
      componentSize="middle"
      typography={{ style: { color: 'inherit' } }}
    >
      <AntApp component={false}>{children}</AntApp>
    </ConfigProvider>
  );
}
