import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '@/shared/test/render';
import { ProfilePage } from './ProfilePage';
import { profileQuery } from '@/entities/user';
import { reviewsQuery } from '@/entities/stats';
import { useDateRangeStore } from '@/features/date-range-filter';
import type { UserProfile } from '@/entities/user/model/profile';
import { ROUTES } from '@/app/router/paths';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const profile = (): UserProfile => ({
  user: {
    id: 1,
    email: 'boris@x5.ru',
    username: 'boris',
    name: 'Boris O',
    avatarUrl: null,
    kaitenId: null,
    gitlabId: null,
    team: 'Маркировка',
    isLead: true,
  },
  summary: {
    email: 'boris@x5.ru',
    commits: 42,
    mergeCommits: 2,
    addedLines: 120,
    deletedLines: 30,
    testAddedLines: 10,
  },
  commits: [],
  cards: [],
});

describe('<ProfilePage> smoke', () => {
  it('рендерится по /users/:email и показывает имя пользователя', async () => {
    renderWithProviders(
      <Routes>
        <Route path={ROUTES.profileMask} element={<ProfilePage />} />
      </Routes>,
      {
        route: ROUTES.profile('boris@x5.ru'),
        setupQueryCache: (qc) => {
          const range = useDateRangeStore.getState().range;
          qc.setQueryData(
            profileQuery('boris@x5.ru', { from: range.from, to: range.to }).queryKey,
            profile(),
          );
          qc.setQueryData(reviewsQuery({ from: range.from, to: range.to }).queryKey, {
            from: '2026-05-01',
            to: '2026-05-31',
            authors: [],
          });
        },
      },
    );

    await waitFor(() => {
      expect(screen.getAllByText('Boris O').length).toBeGreaterThan(0);
    });
  });
});
