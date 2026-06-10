import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { renderWithProviders } from '@/shared/test/render';
import { DashboardPage } from './DashboardPage';
import { dashboardQuery, dashboardPrevQuery } from '@/entities/dashboard';
import { useDateRangeStore } from '@/features/date-range-filter';
import type { DashboardData } from '@/entities/dashboard/model/types';
import { makeAuthor } from '@/shared/test/factories';

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
  const setup = (qc: QueryClient) => {
    // Period динамический (lastNDays(30) от сегодня) — берём актуальный из стора,
    // чтобы ключ совпал с тем, по которому страница запрашивает данные.
    const range = useDateRangeStore.getState().range;
    qc.setQueryData(dashboardQuery(range).queryKey, fixture());
    qc.setQueryData(dashboardPrevQuery(range).queryKey, fixture());
  };

  it('рендерится без падений и показывает заголовок «Дашборд»', async () => {
    renderWithProviders(<DashboardPage />, { setupQueryCache: setup });
    await waitFor(() => {
      expect(screen.getByText('Дашборд')).toBeInTheDocument();
    });
  });

  it('видна метрика «Авторов» из summary (2 в фикстуре)', async () => {
    renderWithProviders(<DashboardPage />, { setupQueryCache: setup });
    await waitFor(() => {
      const matches = screen.queryAllByText('2');
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
