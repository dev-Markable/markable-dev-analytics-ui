import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/test/render';
import { ALL_TEAMS, useTeamScopeStore } from '@/features/team-scope';
import { apiClient } from '@/shared/api/client';
import { DefectsPage } from './DefectsPage';

vi.mock('@/shared/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  useTeamScopeStore.setState({ scope: ALL_TEAMS });
  vi.clearAllMocks();
});

describe('<DefectsPage> smoke', () => {
  it('без выбранной команды — просит выбрать команду', async () => {
    useTeamScopeStore.setState({ scope: ALL_TEAMS });
    renderWithProviders(<DefectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Дефекты по приоритету')).toBeInTheDocument();
    });
    expect(screen.getByText('Выберите команду')).toBeInTheDocument();
  });

  it('с выбранной командой — рендерит редактор периодов и кнопку сабмита', async () => {
    useTeamScopeStore.setState({ scope: 'Platform' });
    renderWithProviders(<DefectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Периоды')).toBeInTheDocument();
    });
    expect(screen.getByText('Период 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Показать дефекты/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Добавить период/ })).toBeInTheDocument();
  });

  it('сабмит → рисует результат, пирог доли AI и детальную таблицу дефектов', async () => {
    useTeamScopeStore.setState({ scope: 'Platform' });
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        team: 'Platform',
        periods: [
          {
            from: '2026-04-01',
            to: '2026-04-30',
            total: 4,
            aiAgentCount: 1,
            byPriority: { critical: 0, high: 2, medium: 1, low: 1, unknown: 0 },
          },
        ],
        defects: [
          {
            id: 150766,
            title: 'Не грузится отчёт',
            url: 'https://kaiten.x5.ru/150766',
            createdAt: '2026-04-05T10:00:00',
            aiAgent: false,
            members: [{ email: 'boris@x5.ru', displayName: 'Boris', avatarUrl: null }],
          },
        ],
      },
    });

    renderWithProviders(<DefectsPage />);

    await userEvent.click(await screen.findByRole('button', { name: /Показать дефекты/ }));

    await waitFor(() => {
      expect(screen.getByText('Результат')).toBeInTheDocument();
    });
    // Пирог: 1 из 4 → 25%.
    expect(screen.getByText('25%')).toBeInTheDocument();
    // Детальная таблица дефектов.
    expect(screen.getByText('Дефекты')).toBeInTheDocument();
    expect(screen.getByText('Не грузится отчёт')).toBeInTheDocument();
    // POST на нужный эндпоинт с телом team+periods.
    expect(apiClient.post).toHaveBeenCalledWith(
      '/stats/defects',
      expect.objectContaining({ team: 'Platform' }),
      expect.anything(),
    );
  });
});
