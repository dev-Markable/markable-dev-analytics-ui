import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';

interface RenderRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Стартовый маршрут MemoryRouter'а. */
  route?: string;
  /** Шаблон роутов (`:email` и т.п.) — для тестов с useParams. */
  path?: string;
}

/**
 * Боевая обёртка для page-level UI-тестов.
 *
 * - `MemoryRouter` со стартовым роутом, чтобы `useNavigate`/`Link` работали;
 * - `ConfigProvider` без `cssVar` (в тестах нам не нужны CSS переменные);
 * - `AntApp` — чтобы `App.useApp()` в дочерних виджетах не бросал
 *   «App.useApp can only be used inside AntApp».
 *
 * Не подменяет глобальные сторы — это делает каждый тест сам через `setState`
 * или `vi.spyOn`.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...options }: RenderRouterOptions = {},
): RenderResult {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ConfigProvider locale={ruRU}>
      <AntApp>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AntApp>
    </ConfigProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}
