import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/render';
import { PerformanceReviewPage } from './PerformanceReviewPage';
import { usersQuery } from '@/entities/user';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('<PerformanceReviewPage> smoke', () => {
  it('без email — рендерится заголовок и empty-state «Выберите разработчика»', async () => {
    renderWithProviders(<PerformanceReviewPage />, {
      setupQueryCache: (qc) => {
        qc.setQueryData(usersQuery().queryKey, []);
      },
    });

    await waitFor(() => {
      expect(screen.getAllByText('Performance Review').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Выберите разработчика').length).toBeGreaterThan(0);
    });
  });
});
