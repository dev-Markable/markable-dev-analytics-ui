import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface RenderRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Стартовый маршрут MemoryRouter'а. */
  route?: string;
  /**
   * Колбэк для предзаполнения кэша QueryClient'а: `qc.setQueryData(...)`.
   * Это аналог «положить данные в стор» в pre-TanStack эпоху.
   */
  setupQueryCache?: (qc: QueryClient) => void;
}

/**
 * Боевая обёртка для page-level UI-тестов.
 *
 * - `QueryClientProvider` с собственным клиентом на тест (retry: 0, без cache
 *   между тестами — изоляция);
 * - `MemoryRouter` со стартовым роутом, чтобы `useNavigate`/`Link` работали;
 * - `ConfigProvider` без `cssVar` (в тестах нам не нужны CSS переменные);
 * - `AntApp` — чтобы `App.useApp()` в дочерних виджетах не бросал
 *   «App.useApp can only be used inside AntApp».
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', setupQueryCache, ...options }: RenderRouterOptions = {},
): RenderResult & { queryClient: QueryClient } {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  setupQueryCache?.(queryClient);

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={ruRU}>
        <AntApp>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient };
}
