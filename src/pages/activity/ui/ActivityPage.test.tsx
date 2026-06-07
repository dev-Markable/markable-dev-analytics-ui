import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/render';
import { ActivityPage } from './ActivityPage';
import { dailyQuery, hourlyQuery, reviewsQuery } from '@/entities/stats';
import { dashboardQuery } from '@/entities/dashboard';
import { usersQuery } from '@/entities/user';
import { useDateRangeStore } from '@/features/date-range-filter';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('<ActivityPage> smoke', () => {
  it('рендерится без падений и показывает заголовок «Активность»', async () => {
    renderWithProviders(<ActivityPage />, {
      setupQueryCache: (qc) => {
        const range = useDateRangeStore.getState().range;
        qc.setQueryData(dailyQuery({ from: range.from, to: range.to }).queryKey, []);
        qc.setQueryData(hourlyQuery({ from: range.from, to: range.to }).queryKey, {
          from: range.from,
          to: range.to,
          cells: [],
        });
        qc.setQueryData(reviewsQuery({ from: range.from, to: range.to }).queryKey, {
          from: range.from,
          to: range.to,
          authors: [],
        });
        qc.setQueryData(dashboardQuery({ from: range.from, to: range.to }).queryKey, {
          from: range.from,
          to: range.to,
          totalElements: 0,
          totalPages: 0,
          page: 0,
          size: 500,
          hasNext: false,
          items: [],
        });
        qc.setQueryData(usersQuery().queryKey, []);
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Активность')).toBeInTheDocument();
    });
  });
});
