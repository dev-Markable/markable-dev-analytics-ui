import { describe, expect, it } from 'vitest';
import { makeCard, makeCommit } from '@/shared/test/factories';
import type { UserProfile } from '@/entities/user';
import { buildTaskColumns, maxTaskCommits, TASKS_PER_COLUMN } from './build-columns';

const profile = (over: Partial<UserProfile> = {}): UserProfile =>
  ({
    user: { id: 1, email: 'a@x.ru', name: 'Анна', team: 'Маркировка', isLead: false },
    summary: {},
    commits: [],
    cards: [],
    ...over,
  }) as UserProfile;

describe('buildTaskColumns', () => {
  it('сортирует задачи по убыванию коммитов', () => {
    const cards = [makeCard({ id: 1 }), makeCard({ id: 2 })];
    const commits = [
      makeCommit({ taskNumber: '1', hash: 'h1', message: '1' }),
      makeCommit({ taskNumber: '2', hash: 'h2', message: '2' }),
      makeCommit({ taskNumber: '2', hash: 'h3', message: '3' }),
    ];

    const [col] = buildTaskColumns([profile({ commits, cards })]);

    expect(col?.tasks.map((t) => t.card?.id)).toEqual([2, 1]);
  });

  it('карточки без коммитов в периоде в колонку не попадают', () => {
    // В профиле такие уместны — там виден весь бэклог; в сравнении это колонки нулей.
    const cards = [makeCard({ id: 1 }), makeCard({ id: 99 })];
    const commits = [makeCommit({ taskNumber: '1', hash: 'h1', message: '1' })];

    const [col] = buildTaskColumns([profile({ commits, cards })]);

    expect(col?.tasks.map((t) => t.card?.id)).toEqual([1]);
    expect(col?.totalTasks).toBe(1);
  });

  it('коммиты без номера задачи уходят в отдельный счётчик, а не в список', () => {
    const commits = [
      makeCommit({ taskNumber: null, hash: 'h1', message: 'fix' }),
      makeCommit({ taskNumber: null, hash: 'h2', message: 'fix2' }),
    ];

    const [col] = buildTaskColumns([profile({ commits, cards: [] })]);

    expect(col?.tasks).toEqual([]);
    expect(col?.orphanCommits).toBe(2);
  });

  it('список обрезается, но totalTasks помнит полное число', () => {
    const many = TASKS_PER_COLUMN + 4;
    const cards = Array.from({ length: many }, (_, i) => makeCard({ id: 100 + i }));
    const commits = cards.map((_, i) =>
      makeCommit({ taskNumber: String(100 + i), hash: `h${i}`, message: `m${i}` }),
    );

    const [col] = buildTaskColumns([profile({ commits, cards })]);

    expect(col?.tasks).toHaveLength(TASKS_PER_COLUMN);
    expect(col?.totalTasks).toBe(many);
  });

  it('колонка на каждый профиль, порядок сохраняется', () => {
    const cols = buildTaskColumns([
      profile({ user: { id: 1, email: 'a@x.ru' } as UserProfile['user'] }),
      profile({ user: { id: 2, email: 'b@x.ru' } as UserProfile['user'] }),
    ]);

    expect(cols.map((c) => c.email)).toEqual(['a@x.ru', 'b@x.ru']);
  });
});

describe('buildTaskColumns: агрегаты для сравнения', () => {
  it('считает объём и средний размер задачи', () => {
    const cards = [makeCard({ id: 1 }), makeCard({ id: 2 })];
    const commits = [
      makeCommit({ taskNumber: '1', hash: 'h1', message: '1' }),
      makeCommit({ taskNumber: '2', hash: 'h2', message: '2' }),
      makeCommit({ taskNumber: '2', hash: 'h3', message: '3' }),
    ];

    const [col] = buildTaskColumns([profile({ commits, cards })]);

    expect(col?.totalCommits).toBe(3);
    expect(col?.commitsPerTask).toBeCloseTo(1.5);
  });

  it('разбивка по типу: сумма сегментов сходится с итогом', () => {
    const cards = [
      makeCard({ id: 1, cardType: 'DEVELOPMENT' }),
      makeCard({ id: 2, cardType: 'DEFECT' }),
    ];
    const commits = [
      makeCommit({ taskNumber: '1', hash: 'h1', message: '1' }),
      makeCommit({ taskNumber: '2', hash: 'h2', message: '2' }),
      makeCommit({ taskNumber: '2', hash: 'h3', message: '3' }),
    ];

    const [col] = buildTaskColumns([profile({ commits, cards })]);
    const byType = Object.fromEntries(col!.byType.map((s) => [s.type, s.commits]));

    expect(byType).toEqual({ DEVELOPMENT: 1, DEFECT: 2 });
    expect(col!.byType.reduce((sum, s) => sum + s.commits, 0)).toBe(col?.totalCommits);
  });

  it('задача без карточки уходит в OTHER, а не выпадает из полосы', () => {
    // Номер в коммите есть, карточки в Kaiten нет — типа у группы тоже нет.
    const commits = [makeCommit({ taskNumber: '777', hash: 'h1', message: '777 fix' })];

    const [col] = buildTaskColumns([profile({ commits, cards: [] })]);

    expect(col?.byType).toEqual([{ type: 'OTHER', tasks: 1, commits: 1 }]);
    expect(col!.byType.reduce((sum, s) => sum + s.commits, 0)).toBe(col?.totalCommits);
  });

  it('пустые сегменты в разбивку не попадают', () => {
    const cards = [makeCard({ id: 1, cardType: 'DEVELOPMENT' })];
    const commits = [makeCommit({ taskNumber: '1', hash: 'h1', message: '1' })];

    const [col] = buildTaskColumns([profile({ commits, cards })]);

    expect(col?.byType.map((s) => s.type)).toEqual(['DEVELOPMENT']);
  });

  it('считает доведённые до DONE', () => {
    const cards = [
      makeCard({ id: 1, columnStatus: 'DONE' }),
      makeCard({ id: 2, columnStatus: 'IN_PROGRESS' }),
    ];
    const commits = [
      makeCommit({ taskNumber: '1', hash: 'h1', message: '1' }),
      makeCommit({ taskNumber: '2', hash: 'h2', message: '2' }),
    ];

    const [col] = buildTaskColumns([profile({ commits, cards })]);

    expect(col?.doneTasks).toBe(1);
  });

  it('пустая колонка не даёт деления на ноль', () => {
    const [col] = buildTaskColumns([profile()]);

    expect(col?.commitsPerTask).toBe(0);
    expect(col?.byType).toEqual([]);
  });
});

describe('maxTaskCommits', () => {
  it('шкала общая для всех колонок — иначе списки несопоставимы', () => {
    const big = profile({
      user: { id: 1, email: 'a@x.ru' } as UserProfile['user'],
      cards: [makeCard({ id: 1 })],
      commits: Array.from({ length: 35 }, (_, i) =>
        makeCommit({ taskNumber: '1', hash: `a${i}`, message: `a${i}` }),
      ),
    });
    const small = profile({
      user: { id: 2, email: 'b@x.ru' } as UserProfile['user'],
      cards: [makeCard({ id: 2 })],
      commits: [makeCommit({ taskNumber: '2', hash: 'b1', message: 'b1' })],
    });

    expect(maxTaskCommits(buildTaskColumns([big, small]))).toBe(35);
  });

  it('колонок без задач достаточно, чтобы не делить на ноль', () => {
    expect(maxTaskCommits(buildTaskColumns([profile()]))).toBe(1);
  });
});
