import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/render';
import { TeamsPage } from './TeamsPage';
import { useTeamsStore } from '@/entities/team';
import { useUsersStore } from '@/entities/user';
import { asyncSuccess, idleAsyncState } from '@/shared/api';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('<TeamsPage> smoke', () => {
  beforeEach(() => {
    useTeamsStore.setState({
      state: asyncSuccess([
        {
          name: 'Маркировка',
          lead: null,
          members: [
            {
              id: 1,
              email: 'a@x5.ru',
              username: 'a',
              name: 'Alpha User',
              avatarUrl: null,
              kaitenId: null,
              gitlabId: null,
              team: 'Маркировка',
              isLead: false,
            },
          ],
        },
      ]),
    });
    useUsersStore.setState({ state: asyncSuccess([]) });
  });

  afterEach(() => {
    useTeamsStore.setState({ state: idleAsyncState() });
    useUsersStore.setState({ state: idleAsyncState() });
  });

  it('рендерится без падений, показывает заголовок и название команды', async () => {
    renderWithProviders(<TeamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Команды')).toBeInTheDocument();
      expect(screen.getByText('Маркировка')).toBeInTheDocument();
    });
  });

  it('показывает участников команды', async () => {
    renderWithProviders(<TeamsPage />);
    expect(await screen.findByText('Alpha User')).toBeInTheDocument();
  });
});
