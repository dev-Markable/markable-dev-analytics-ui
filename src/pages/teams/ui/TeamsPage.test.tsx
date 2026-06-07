import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { renderWithProviders } from '@/shared/test/render';
import { TeamsPage } from './TeamsPage';
import { teamsQuery } from '@/entities/team';
import { usersQuery } from '@/entities/user';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('<TeamsPage> smoke', () => {
  const setup = (qc: QueryClient) => {
    qc.setQueryData(teamsQuery().queryKey, [
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
    ]);
    qc.setQueryData(usersQuery().queryKey, []);
  };

  it('рендерится без падений, показывает заголовок и название команды', async () => {
    renderWithProviders(<TeamsPage />, { setupQueryCache: setup });
    await waitFor(() => {
      expect(screen.getByText('Команды')).toBeInTheDocument();
      expect(screen.getByText('Маркировка')).toBeInTheDocument();
    });
  });

  it('показывает участников команды', async () => {
    renderWithProviders(<TeamsPage />, { setupQueryCache: setup });
    expect(await screen.findByText('Alpha User')).toBeInTheDocument();
  });
});
