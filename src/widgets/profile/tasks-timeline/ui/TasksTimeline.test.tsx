import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksTimeline } from './TasksTimeline';
import { makeCard, makeCommit } from '@/shared/test/factories';

/** N задач с одним коммитом в каждой — чтобы проверить порог «показать ещё». */
const manyTasks = (count: number) => {
  const cards = Array.from({ length: count }, (_, i) => makeCard({ id: 1000 + i }));
  const commits = cards.map((_, i) =>
    makeCommit({ message: `${i} fix`, taskNumber: String(1000 + i), hash: `h${i}` }),
  );
  return { cards, commits };
};

describe('<TasksTimeline>', () => {
  it('раскрывает коммиты задачи по клику на строку', async () => {
    const card = makeCard({ id: 42, title: 'Починить логин' });
    const commit = makeCommit({
      message: 'fix auth redirect',
      taskNumber: '42',
      hash: 'abc1234',
    });

    render(<TasksTimeline commits={[commit]} cards={[card]} email="a@b.c" />);

    expect(screen.getByText('Починить логин')).toBeInTheDocument();
    expect(screen.queryByText(/fix auth redirect/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { expanded: false }));

    expect(screen.getByText(/fix auth redirect/)).toBeInTheDocument();
  });

  it('показывает первые 20 задач и догружает остальные по кнопке', async () => {
    const { cards, commits } = manyTasks(25);

    render(<TasksTimeline commits={commits} cards={cards} email="a@b.c" />);

    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(20);

    await userEvent.click(screen.getByRole('button', { name: /Показать ещё 5/ }));

    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(25);
    expect(screen.queryByRole('button', { name: /Показать ещё/ })).not.toBeInTheDocument();
  });

  it('пустой результат поиска — empty-state вместо списка', async () => {
    const card = makeCard({ id: 42, title: 'Починить логин' });
    const commit = makeCommit({ message: 'fix', taskNumber: '42', hash: 'h1' });

    render(<TasksTimeline commits={[commit]} cards={[card]} email="a@b.c" />);

    await userEvent.type(screen.getByPlaceholderText(/Поиск по задаче/), 'нет-такого');

    expect(await screen.findByText('Ничего не найдено')).toBeInTheDocument();
  });
});
