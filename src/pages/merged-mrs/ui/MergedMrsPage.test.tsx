import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/render';
import { ALL_TEAMS, useTeamScopeStore } from '@/features/team-scope';
import { apiClient } from '@/shared/api/client';
import { MergedMrsPage } from './MergedMrsPage';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  useTeamScopeStore.setState({ scope: ALL_TEAMS });
  vi.clearAllMocks();
});

describe('<MergedMrsPage> smoke', () => {
  it('без выбранной команды — просит выбрать команду', async () => {
    useTeamScopeStore.setState({ scope: ALL_TEAMS });
    renderWithProviders(<MergedMrsPage />);

    await waitFor(() => {
      expect(screen.getByText('Вмерженные MR')).toBeInTheDocument();
    });
    expect(screen.getByText('Выберите команду')).toBeInTheDocument();
  });

  it('с командой — показывает всего и разбивку по авторам', async () => {
    useTeamScopeStore.setState({ scope: 'Platform' });
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        team: 'Platform',
        from: '2026-05-01',
        to: '2026-05-31',
        total: 37,
        authors: [
          { email: 'boris@x5.ru', displayName: 'Boris Osechinskiy', avatarUrl: null, count: 21 },
        ],
        byRepo: [{ repo: 'gkr/xrg-markable', count: 23 }],
      },
    });

    renderWithProviders(<MergedMrsPage />);

    await waitFor(() => {
      expect(screen.getByText('37')).toBeInTheDocument();
    });
    expect(screen.getByText('По авторам')).toBeInTheDocument();
    expect(screen.getByText('Boris Osechinskiy')).toBeInTheDocument();
    expect(screen.getByText('По репозиториям')).toBeInTheDocument();
    expect(screen.getByText('gkr/xrg-markable')).toBeInTheDocument();
  });
});
