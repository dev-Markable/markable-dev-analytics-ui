import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { TeamScopePicker } from './TeamScopePicker';
import { ALL_TEAMS, useTeamScopeStore } from '../model/team-scope.store';
import { useTeamsStore } from '@/entities/team';
import { asyncSuccess } from '@/shared/api';

/**
 * Smoke + базовые сценарии TeamScopePicker.
 * - Стoр teams мокаем «успешным» загрузкой, чтобы фетч не уходил в сеть.
 * - Скоп-стор — реальный (он persisted в localStorage, jsdom это поддерживает).
 *   Перед каждым тестом сбрасываем в ALL_TEAMS.
 */

const mockTeams = (names: string[]) => {
  useTeamsStore.setState({
    state: asyncSuccess(names.map((name) => ({ name, lead: null, members: [] }))),
  });
};

const renderPicker = () =>
  render(
    <App>
      <TeamScopePicker />
    </App>,
  );

describe('<TeamScopePicker>', () => {
  beforeEach(() => {
    useTeamScopeStore.getState().reset();
    // Заглушаем fetch — иначе стор стартанёт реальный axios через mount.
    vi.spyOn(useTeamsStore.getState(), 'fetch').mockResolvedValue(undefined);
  });

  it('рендерит «Вся компания» как текущий выбор по умолчанию', async () => {
    mockTeams(['Маркировка', 'Платформа']);
    renderPicker();
    expect(await screen.findByText('Вся компания')).toBeInTheDocument();
  });

  it('меняет скоп при выборе команды', async () => {
    mockTeams(['Маркировка', 'Платформа']);
    renderPicker();

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Маркировка'));

    await waitFor(() => {
      expect(useTeamScopeStore.getState().scope).toBe('Маркировка');
    });
  });

  it('если в persisted-store оказалась несуществующая команда — мягко сбрасывается в ALL_TEAMS', async () => {
    useTeamScopeStore.setState({ scope: 'PropalaКоманда' });
    mockTeams(['Маркировка']);
    renderPicker();

    await waitFor(() => {
      expect(useTeamScopeStore.getState().scope).toBe(ALL_TEAMS);
    });
  });
});
