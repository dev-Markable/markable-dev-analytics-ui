import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/test/render';
import type { DefectItem } from '@/entities/stats';
import { DefectsDetailTable } from './DefectsDetailTable';

const defects: DefectItem[] = [
  {
    id: 1,
    title: 'Дефект один',
    url: 'https://kaiten.x5.ru/1',
    createdAt: '2026-04-05T10:00:00',
    aiAgent: false,
    members: [{ email: 'boris@x5.ru', displayName: 'Boris', avatarUrl: null }],
  },
  {
    id: 2,
    title: 'Дефект два',
    url: null,
    createdAt: '2026-04-06T10:00:00',
    aiAgent: true,
    members: [],
  },
];

describe('<DefectsDetailTable>', () => {
  it('рендерит дефекты; у AI-дефекта тег, у обычного (elevated) — кнопка «Отметить»', () => {
    renderWithProviders(
      <DefectsDetailTable defects={defects} canMark marking={false} onMark={vi.fn()} />,
    );

    expect(screen.getByText('Дефект один')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument(); // тег у дефекта 2
    expect(screen.getByRole('button', { name: 'Отметить' })).toBeInTheDocument();
  });

  it('построчная кнопка «Отметить» зовёт onMark с id этого дефекта', async () => {
    const onMark = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <DefectsDetailTable defects={defects} canMark marking={false} onMark={onMark} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Отметить' }));

    expect(onMark).toHaveBeenCalledWith([1]);
  });

  it('«Отметить все без AI» зовёт onMark со всеми id без флага', async () => {
    const onMark = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <DefectsDetailTable defects={defects} canMark marking={false} onMark={onMark} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Отметить все без AI/ }));

    expect(onMark).toHaveBeenCalledWith([1]); // только дефект 1 (у 2 уже AI)
  });

  it('без прав (canMark=false) mark-контролов нет', () => {
    renderWithProviders(
      <DefectsDetailTable defects={defects} canMark={false} marking={false} onMark={vi.fn()} />,
    );

    expect(screen.queryByRole('button', { name: 'Отметить' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Отметить все без AI/ })).not.toBeInTheDocument();
  });

  it('фильтр по участнику оставляет только его дефекты', async () => {
    const data: DefectItem[] = [
      {
        id: 1,
        title: 'Дефект Бориса',
        url: null,
        createdAt: '2026-04-05T10:00:00',
        aiAgent: false,
        members: [{ email: 'boris@x5.ru', displayName: 'Boris', avatarUrl: null }],
      },
      {
        id: 2,
        title: 'Дефект Алисы',
        url: null,
        createdAt: '2026-04-06T10:00:00',
        aiAgent: false,
        members: [{ email: 'alice@x5.ru', displayName: 'Alice', avatarUrl: null }],
      },
    ];
    const { container } = renderWithProviders(
      <DefectsDetailTable defects={data} canMark={false} marking={false} onMark={vi.fn()} />,
    );
    expect(screen.getByText('Дефект Бориса')).toBeInTheDocument();
    expect(screen.getByText('Дефект Алисы')).toBeInTheDocument();

    // Колонка «Участники» — первый filter-trigger; открыть, выбрать Boris, применить.
    const triggers = container.querySelectorAll<HTMLElement>('.ant-table-filter-trigger');
    await userEvent.click(triggers[0]);
    await userEvent.click(await screen.findByText('Boris'));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByText('Дефект Бориса')).toBeInTheDocument();
    expect(screen.queryByText('Дефект Алисы')).not.toBeInTheDocument();
  });
});
