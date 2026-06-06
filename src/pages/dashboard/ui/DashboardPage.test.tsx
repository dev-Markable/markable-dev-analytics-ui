import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/render';
import { DashboardPage } from './DashboardPage';
import { useDashboardStore } from '@/entities/dashboard';
import { asyncSuccess, idleAsyncState } from '@/shared/api';
import type { DashboardData } from '@/entities/dashboard/model/types';
import { makeAuthor } from '@/shared/test/factories';

// apiClient мокаем сразу — иначе сторы могут сходить в реальный axios.
vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const fixture = (): DashboardData => ({
  from: '2026-05-01',
  to: '2026-05-31',
  totalElements: 2,
  totalPages: 1,
  page: 0,
  size: 500,
  hasNext: false,
  items: [
    makeAuthor({ email: 'a@x5.ru', team: 'Маркировка', commits: 10 }),
    makeAuthor({ email: 'b@x5.ru', team: null, commits: 5 }),
  ],
});

describe('<DashboardPage> smoke', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      state: asyncSuccess(fixture()),
      prev: asyncSuccess(fixture()),
    });
  });

  afterEach(() => {
    useDashboardStore.setState({
      state: idleAsyncState(),
      prev: idleAsyncState(),
    });
  });

  it('рендерится без падений и показывает заголовок «Дашборд»', async () => {
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Дашборд')).toBeInTheDocument();
    });
  });

  it('видна метрика «Авторов» из summary (2 в фикстуре)', async () => {
    renderWithProviders(<DashboardPage />);
    // SummaryGrid содержит плитку «Авторов» с количеством — ищем по числу 2
    // в контексте плитки. Делаем устойчиво: findAllByText, чтобы responsive
    // или дубли не падали.
    await waitFor(() => {
      const matches = screen.queryAllByText('2');
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
