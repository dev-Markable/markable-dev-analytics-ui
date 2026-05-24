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

  // cssVar: true — генерирует CSS-переменные `--ant-color-*`, `--ant-box-shadow` и т.д.
  // на :root, чтобы наш собственный CSS мог их использовать. Без этого var(--ant-...)
  // не резолвится и кастомные стили карточек/таблиц получают пустые значения.
  // hashed: false — отключает хэш-классы (читаемая разметка, проще дебажить).
  const themeConfig = { ...getThemeConfig(mode), cssVar: true, hashed: false };

  return (
    <ConfigProvider
      theme={themeConfig}
      locale={ruRU}
      componentSize="middle"
      typography={{ style: { color: 'inherit' } }}
    >
      <AntApp component={false}>{children}</AntApp>
    </ConfigProvider>
  );
}
