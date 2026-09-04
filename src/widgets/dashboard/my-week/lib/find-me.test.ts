import { describe, expect, it } from 'vitest';
import type { AuthorActivity } from '@/entities/user';
import type { ReviewAuthor } from '@/entities/stats';
import { findMyWeek } from './find-me';

const author = (email: string, commits: number): AuthorActivity =>
  ({ email, displayName: email, commits, addedLines: 10, deletedLines: 1 }) as AuthorActivity;

const review = (email: string, reviewsGiven: number, commentsGiven = 0): ReviewAuthor =>
  ({ email, reviewsGiven, commentsGiven }) as ReviewAuthor;

const ITEMS = [author('a@x5.ru', 30), author('boris@x5.ru', 20), author('c@x5.ru', 10)];

describe('findMyWeek', () => {
  it('находит себя и позицию в рейтинге (порядок items = рейтинг)', () => {
    const result = findMyWeek('boris@x5.ru', ITEMS, [review('boris@x5.ru', 5, 12)]);

    expect(result?.rank).toBe(2);
    expect(result?.total).toBe(3);
    expect(result?.me.commits).toBe(20);
    expect(result?.reviewsGiven).toBe(5);
    expect(result?.commentsGiven).toBe(12);
  });

  it('email сопоставляется регистронезависимо', () => {
    expect(findMyWeek('BORIS@x5.ru', ITEMS, [])?.rank).toBe(2);
  });

  it('нет ревью за период → нули, но блок остаётся', () => {
    const result = findMyWeek('boris@x5.ru', ITEMS, []);
    expect(result?.reviewsGiven).toBe(0);
  });

  it('нет коммитов в периоде → null (блок скрывается, а не показывает нули)', () => {
    expect(findMyWeek('stranger@x5.ru', ITEMS, [])).toBeNull();
  });

  it('пользователь не залогинен → null', () => {
    expect(findMyWeek(null, ITEMS, [])).toBeNull();
    expect(findMyWeek(undefined, ITEMS, [])).toBeNull();
  });
});
