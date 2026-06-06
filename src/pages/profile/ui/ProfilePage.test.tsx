import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '@/shared/test/render';
import { ProfilePage } from './ProfilePage';
import { useProfileStore } from '@/entities/user';
import { useReviewsStore } from '@/entities/stats';
import { asyncSuccess, idleAsyncState } from '@/shared/api';
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
  beforeEach(() => {
    useProfileStore.setState({ state: asyncSuccess(profile()) });
    useReviewsStore.setState({
      state: asyncSuccess({ from: '2026-05-01', to: '2026-05-31', authors: [] }),
    });
  });

  afterEach(() => {
    useProfileStore.setState({ state: idleAsyncState() });
    useReviewsStore.setState({ state: idleAsyncState() });
  });

  it('рендерится по /users/:email и показывает имя пользователя', async () => {
    renderWithProviders(
      <Routes>
        <Route path={ROUTES.profileMask} element={<ProfilePage />} />
      </Routes>,
      { route: ROUTES.profile('boris@x5.ru') },
    );

    await waitFor(() => {
      // Имя может рендериться в нескольких местах (title, header).
      // Достаточно проверить, что оно вообще появилось.
      expect(screen.getAllByText('Boris O').length).toBeGreaterThan(0);
    });
  });
});
