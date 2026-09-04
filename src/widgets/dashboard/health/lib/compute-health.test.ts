import { describe, expect, it } from 'vitest';
import type { AuthorActivity } from '@/entities/user';
import type { DailyStat, ReviewAuthor } from '@/entities/stats';
import { computeHealth } from './compute-health';

const author = (email: string, commits: number): AuthorActivity =>
  ({ email, commits }) as AuthorActivity;

const daily = (addedLines: number, testAddedLines: number): DailyStat =>
  ({ addedLines, testAddedLines }) as DailyStat;

const review = (email: string, reviewsGiven: number): ReviewAuthor =>
  ({ email, reviewsGiven }) as ReviewAuthor;

const byKey = (items: ReturnType<typeof computeHealth>, key: string) =>
  items.find((i) => i.key === key);

describe('computeHealth', () => {
  it('доля тестового кода = testAdded / added', () => {
    const res = computeHealth([author('a@x5.ru', 1)], [daily(1000, 200)], []);
    expect(byKey(res, 'test-ratio')?.value).toBe('20.0%');
    expect(byKey(res, 'test-ratio')?.tone).toBe('good');
  });

  it('нулевые added-строки не роняют расчёт (без деления на ноль)', () => {
    const res = computeHealth([author('a@x5.ru', 1)], [daily(0, 0)], []);
    expect(byKey(res, 'test-ratio')?.value).toBe('0.0%');
    expect(byKey(res, 'test-ratio')?.tone).toBe('bad');
  });

  it('bus factor: сколько авторов дают половину коммитов', () => {
    // 50 + 30 + 20 = 100; половина набирается первым же автором
    const res = computeHealth(
      [author('a@x5.ru', 50), author('b@x5.ru', 30), author('c@x5.ru', 20)],
      [],
      [],
    );
    expect(byKey(res, 'bus-factor')?.value).toBe('1');
    expect(byKey(res, 'bus-factor')?.tone).toBe('bad');
  });

  it('равномерная команда даёт высокий bus factor', () => {
    const res = computeHealth(
      [author('a@x5.ru', 10), author('b@x5.ru', 10), author('c@x5.ru', 10), author('d@x5.ru', 10)],
      [],
      [],
    );
    expect(byKey(res, 'bus-factor')?.value).toBe('2');
  });

  it('покрытие ревью считает только тех, кто реально ревьюил', () => {
    const res = computeHealth(
      [author('a@x5.ru', 1), author('b@x5.ru', 1)],
      [],
      [review('a@x5.ru', 3), review('b@x5.ru', 0)],
    );
    expect(byKey(res, 'review-coverage')?.value).toBe('50%');
    expect(byKey(res, 'review-coverage')?.hint).toBe('1 из 2 разработчиков');
  });

  it('пустая команда не роняет расчёт', () => {
    const res = computeHealth([], [], []);
    expect(byKey(res, 'contributors')?.value).toBe('0');
    expect(byKey(res, 'review-coverage')?.value).toBe('0%');
  });
});
