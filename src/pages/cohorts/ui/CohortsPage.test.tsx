import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/render';
import { CohortsPage } from './CohortsPage';
import {
  cohortActivityMatrixQuery,
  cohortRetentionQuery,
  tierTransitionsQuery,
} from '@/entities/cohort';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('<CohortsPage> smoke', () => {
  it('рендерится без падений и показывает заголовок', async () => {
    renderWithProviders(<CohortsPage />, {
      setupQueryCache: (qc) => {
        qc.setQueryData(cohortRetentionQuery({ team: undefined }).queryKey, {
          interval: 'month',
          cohorts: [],
        });
        qc.setQueryData(cohortActivityMatrixQuery({ team: undefined }).queryKey, {
          months: [],
          developers: [],
        });
        qc.setQueryData(tierTransitionsQuery({ team: undefined }).queryKey, {
          tiers: [],
          matrix: [],
        });
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Когорты и удержание')).toBeInTheDocument();
    });
  });
});
