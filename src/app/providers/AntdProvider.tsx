import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { getThemeConfig, type ThemeMode } from '@/shared/lib';
import { useThemeStore } from '@/features/theme-switch';

interface AntdProviderProps {
  mode: ThemeMode;
  children: ReactNode;
}

export function AntdProvider({ mode, children }: AntdProviderProps) {
  const density = useThemeStore((s) => s.density);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  // cssVar: true — генерирует CSS-переменные `--ant-color-*`, `--ant-box-shadow` и т.д.
  // на :root, чтобы наш собственный CSS мог их использовать. Без этого var(--ant-...)
  // не резолвится и кастомные стили карточек/таблиц получают пустые значения.
  // hashed: false — отключает хэш-классы (читаемая разметка, проще дебажить).
  const themeConfig = {
    ...getThemeConfig(mode),
    cssVar: true,
    hashed: false,
    components: {
      ...getThemeConfig(mode).components,
      // Компактная плотность — только таблицы: главный сканируемый массив
      // в аналитике. Контролы остаются просторными, чтобы не переверстывать
      // полприложения ради экономии 4px на кнопке.
      ...(density === 'compact' ? { Table: { cellPaddingBlock: 9, cellPaddingInline: 12 } } : {}),
    },
  };

  return (
    <ConfigProvider
      theme={themeConfig}
      locale={ruRU}
      componentSize="middle"
      typography={{ style: { color: 'inherit' } }}
    >
      {/* cssVar: true требует, чтобы у AntApp был DOM-элемент-обёртка,
          на который AntD навесит класс с CSS-переменными.
          Дефолт component="div" — оставляем как есть. */}
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
