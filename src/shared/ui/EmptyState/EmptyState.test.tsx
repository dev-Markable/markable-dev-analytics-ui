import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from './EmptyState';

describe('<EmptyState>', () => {
  it('по умолчанию рисует «Нет данных»', () => {
    render(<EmptyState />);
    expect(screen.getByText('Нет данных')).toBeInTheDocument();
  });

  it('кастомные title и description видны', () => {
    render(<EmptyState title="Пусто" description="Здесь ничего нет" />);
    expect(screen.getByText('Пусто')).toBeInTheDocument();
    expect(screen.getByText('Здесь ничего нет')).toBeInTheDocument();
  });

  it('action рендерит кнопку и зовёт onClick', async () => {
    const onClick = vi.fn();
    render(<EmptyState action={{ label: 'Повторить', onClick }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('без action кнопки нет', () => {
    render(<EmptyState />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
