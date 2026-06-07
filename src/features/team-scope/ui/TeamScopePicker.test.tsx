import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { QueryClient } from '@tanstack/react-query';
import { renderWithProviders } from '@/shared/test/render';
import { TeamScopePicker } from './TeamScopePicker';
import { ALL_TEAMS, useTeamScopeStore } from '../model/team-scope.store';
import { teamsQuery } from '@/entities/team';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const setupTeams = (names: string[]) => (qc: QueryClient) => {
  qc.setQueryData(
    teamsQuery().queryKey,
    names.map((name) => ({ name, lead: null, members: [] })),
  );
};

describe('<TeamScopePicker>', () => {
  beforeEach(() => {
    useTeamScopeStore.getState().reset();
  });

  it('рендерит «Вся компания» как текущий выбор по умолчанию', async () => {
    renderWithProviders(<TeamScopePicker />, {
      setupQueryCache: setupTeams(['Маркировка', 'Платформа']),
    });
    expect(await screen.findByText('Вся компания')).toBeInTheDocument();
  });

  it('меняет скоп при выборе команды', async () => {
    renderWithProviders(<TeamScopePicker />, {
      setupQueryCache: setupTeams(['Маркировка', 'Платформа']),
    });

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Маркировка'));

    await waitFor(() => {
      expect(useTeamScopeStore.getState().scope).toBe('Маркировка');
    });
  });

  it('если в persisted-store оказалась несуществующая команда — мягко сбрасывается в ALL_TEAMS', async () => {
    useTeamScopeStore.setState({ scope: 'PropalaКоманда' });
    renderWithProviders(<TeamScopePicker />, {
      setupQueryCache: setupTeams(['Маркировка']),
    });

    await waitFor(() => {
      expect(useTeamScopeStore.getState().scope).toBe(ALL_TEAMS);
    });
  });
});
