import { describe, expect, it } from 'vitest';
import { makeAuthor } from '@/shared/test/factories';
import { COMPARE_ROWS, rowCells, type CompareRow } from './rows';

const row = (key: string): CompareRow => {
  const found = COMPARE_ROWS.find((r) => r.key === key);
  if (!found) throw new Error(`нет строки ${key}`);
  return found;
};

const author = (email: string, over: Parameters<typeof makeAuthor>[0] = {}) =>
  makeAuthor({ email, mergeCommits: 0, ...over });

describe('rowCells', () => {
  it('доля считается от лидера строки, лидер выделяется', () => {
    const cells = rowCells(row('addedLines'), [
      author('a@x.ru', { addedLines: 1000 }),
      author('b@x.ru', { addedLines: 250 }),
    ]);

    expect(cells[0]).toMatchObject({ share: 1, isLeader: true });
    expect(cells[1]).toMatchObject({ share: 0.25, isLeader: false });
  });

  it('ничья → лидера нет, но полосы остаются', () => {
    const cells = rowCells(row('addedLines'), [
      author('a@x.ru', { addedLines: 500 }),
      author('b@x.ru', { addedLines: 500 }),
    ]);

    expect(cells.every((c) => !c.isLeader)).toBe(true);
    expect(cells.map((c) => c.share)).toEqual([1, 1]);
  });

  it('у всех нули → ни лидера, ни долей', () => {
    const cells = rowCells(row('addedLines'), [
      author('a@x.ru', { addedLines: 0 }),
      author('b@x.ru', { addedLines: 0 }),
    ]);

    expect(cells.map((c) => c.share)).toEqual([null, null]);
    expect(cells.every((c) => !c.isLeader)).toBe(true);
  });

  it('неранжируемая метрика не получает ни полосы, ни лидера', () => {
    const authors = [
      author('a@x.ru', { deletedLines: 5000 }),
      author('b@x.ru', { deletedLines: 10 }),
    ];

    // «Удалено» — чистка кода, направление не задано.
    for (const key of ['deletedLines', 'mergeCommits', 'linesPerCommit', 'testRatio']) {
      const cells = rowCells(row(key), authors);
      expect(cells.every((c) => c.share === null), key).toBe(true);
      expect(cells.every((c) => !c.isLeader), key).toBe(true);
    }
  });

  it('activity score отсутствует у части авторов → строка не ранжируется', () => {
    const cells = rowCells(row('score'), [
      makeAuthor({ email: 'a@x.ru' }),
      makeAuthor({ email: 'b@x.ru', activity: null }),
    ]);

    expect(cells.every((c) => c.share === null)).toBe(true);
    expect(cells[1]?.display).toBe('—');
  });

  it('доля тестов показывается, но не ранжируется ни в одну сторону', () => {
    const cells = rowCells(row('testRatio'), [
      author('a@x.ru', { addedLines: 100, testAddedLines: 87 }),
      author('b@x.ru', { addedLines: 100, testAddedLines: 30 }),
    ]);

    // Корона за 87% означала бы «чем больше тестов, тем лучше», а разворот —
    // что ноль тестов лучше всего. Оптимум посередине, поэтому короны нет ни у кого.
    expect(cells.map((c) => c.display)).toEqual(['87.0%', '30.0%']);
    expect(cells.every((c) => !c.isLeader && c.share === null)).toBe(true);
  });
});
