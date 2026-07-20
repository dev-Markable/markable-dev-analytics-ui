import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/shared/test/render';
import { BulkMarkProgress } from './BulkMarkProgress';

describe('<BulkMarkProgress>', () => {
  it('открытая модалка показывает кол-во карточек и оценку времени (~4/сек)', () => {
    renderWithProviders(<BulkMarkProgress open total={40} />);

    expect(screen.getByText('Простановка AI-Agent')).toBeInTheDocument();
    expect(screen.getByText(/Обновляем 40 карточек/)).toBeInTheDocument();
    expect(screen.getByText(/~10/)).toBeInTheDocument(); // 40 / 4 = 10 c
  });

  it('закрытая — контент не рендерится', () => {
    renderWithProviders(<BulkMarkProgress open={false} total={40} />);

    expect(screen.queryByText('Простановка AI-Agent')).not.toBeInTheDocument();
  });
});
