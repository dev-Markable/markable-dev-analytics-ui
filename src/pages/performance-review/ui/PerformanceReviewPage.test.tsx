import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/render';
import { PerformanceReviewPage } from './PerformanceReviewPage';
import { useUsersStore } from '@/entities/user';
import { asyncSuccess } from '@/shared/api';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('<PerformanceReviewPage> smoke', () => {
  it('без email — рендерится заголовок и empty-state «Выберите разработчика»', async () => {
    useUsersStore.setState({ state: asyncSuccess([]) });

    renderWithProviders(<PerformanceReviewPage />);

    await waitFor(() => {
      // Заголовок страницы появляется и в шапке, и в document.title.
      expect(screen.getAllByText('Performance Review').length).toBeGreaterThan(0);
      // «Выберите разработчика» — placeholder Select'а + title EmptyState.
      expect(screen.getAllByText('Выберите разработчика').length).toBeGreaterThan(0);
    });
  });
});
