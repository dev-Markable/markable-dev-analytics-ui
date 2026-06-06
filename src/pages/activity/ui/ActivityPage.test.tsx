import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/render';
import { ActivityPage } from './ActivityPage';
import {
  useDailyStore,
  useHourlyStore,
  useReviewsStore,
} from '@/entities/stats';
import { useDashboardStore } from '@/entities/dashboard';
import { useUsersStore } from '@/entities/user';
import { asyncSuccess, idleAsyncState } from '@/shared/api';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('<ActivityPage> smoke', () => {
  beforeEach(() => {
    useDailyStore.setState({ state: asyncSuccess([]) });
    useHourlyStore.setState({
      state: asyncSuccess({ from: '2026-05-01', to: '2026-05-31', cells: [] }),
    });
    useReviewsStore.setState({
      state: asyncSuccess({ from: '2026-05-01', to: '2026-05-31', authors: [] }),
    });
    const emptyDashboard = {
      from: '2026-05-01',
      to: '2026-05-31',
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 500,
      hasNext: false,
      items: [],
    };
    useDashboardStore.setState({
      state: asyncSuccess(emptyDashboard),
      prev: asyncSuccess(emptyDashboard),
    });
    useUsersStore.setState({ state: asyncSuccess([]) });
  });

  afterEach(() => {
    useDailyStore.setState({ state: idleAsyncState() });
    useHourlyStore.setState({ state: idleAsyncState() });
    useReviewsStore.setState({ state: idleAsyncState() });
    useDashboardStore.setState({ state: idleAsyncState(), prev: idleAsyncState() });
    useUsersStore.setState({ state: idleAsyncState() });
  });

  it('рендерится без падений и показывает заголовок «Активность»', async () => {
    renderWithProviders(<ActivityPage />);
    await waitFor(() => {
      expect(screen.getByText('Активность')).toBeInTheDocument();
    });
  });
});
