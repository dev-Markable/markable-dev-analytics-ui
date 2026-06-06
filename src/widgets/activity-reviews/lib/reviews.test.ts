import { describe, expect, it } from 'vitest';
import { engagementOf, sortByEngagement, formatHours } from './reviews';
import type { ReviewAuthor } from '@/entities/stats';

const author = (over: Partial<ReviewAuthor>): ReviewAuthor => ({
  email: 'a@x5.ru',
  displayName: null,
  avatarUrl: null,
  reviewsGiven: 0,
  commentsGiven: 0,
  reviewsReceived: 0,
  avgTimeToMergeHours: 0,
  isLead: false,
  ...over,
});

describe('engagementOf', () => {
  it('approve + комментарии', () => {
    expect(engagementOf(author({ reviewsGiven: 5, commentsGiven: 10 }))).toBe(15);
  });
});

describe('sortByEngagement', () => {
  it('по убыванию вовлечённости', () => {
    const list = [
      author({ email: 'low@x5.ru', reviewsGiven: 1, commentsGiven: 1 }),
      author({ email: 'high@x5.ru', reviewsGiven: 10, commentsGiven: 5 }),
    ];
    expect(sortByEngagement(list).map((a) => a.email)).toEqual(['high@x5.ru', 'low@x5.ru']);
  });

  it('tie-break по email', () => {
    const list = [
      author({ email: 'b@x5.ru', reviewsGiven: 2 }),
      author({ email: 'a@x5.ru', reviewsGiven: 2 }),
    ];
    expect(sortByEngagement(list).map((a) => a.email)).toEqual(['a@x5.ru', 'b@x5.ru']);
  });

  it('не мутирует исходный массив', () => {
    const list = [author({ email: 'a@x5.ru' })];
    const sorted = sortByEngagement(list);
    expect(sorted).not.toBe(list);
  });
});

describe('formatHours', () => {
  it('часы при <24', () => {
    expect(formatHours(18.5)).toBe('19 ч');
  });
  it('дни при >=24', () => {
    expect(formatHours(36)).toBe('1.5 дн');
  });
  it('0 / нет данных → тире', () => {
    expect(formatHours(0)).toBe('—');
    expect(formatHours(-1)).toBe('—');
  });
});
