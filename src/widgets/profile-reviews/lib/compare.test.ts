import { describe, expect, it } from 'vitest';
import { buildProfileReviewStats } from './compare';
import type { ReviewAuthor, ReviewStats } from '@/entities/stats';

const author = (over: Partial<ReviewAuthor>): ReviewAuthor => ({
  email: 'a@x5.ru',
  displayName: null,
  avatarUrl: null,
  reviewsGiven: 0,
  commentsGiven: 0,
  reviewsReceived: 0,
  avgTimeToMergeHours: 0,
  ...over,
});

const stats = (authors: ReviewAuthor[]): ReviewStats => ({
  from: '2026-05-01',
  to: '2026-05-31',
  authors,
});

describe('buildProfileReviewStats', () => {
  it('null stats → null', () => {
    expect(buildProfileReviewStats(null, 'a@x5.ru')).toBeNull();
  });

  it('автора нет в выборке → null', () => {
    const s = stats([author({ email: 'other@x5.ru', reviewsGiven: 5 })]);
    expect(buildProfileReviewStats(s, 'a@x5.ru')).toBeNull();
  });

  it('email матчится регистронезависимо', () => {
    const s = stats([author({ email: 'Boris@X5.ru', reviewsGiven: 5 })]);
    expect(buildProfileReviewStats(s, 'boris@x5.ru')?.author.email).toBe('Boris@X5.ru');
  });

  it('standing above/below/around относительно среднего активных', () => {
    const s = stats([
      author({ email: 'hi@x5.ru', reviewsGiven: 20, commentsGiven: 1 }),
      author({ email: 'mid@x5.ru', reviewsGiven: 10, commentsGiven: 1 }),
      author({ email: 'lo@x5.ru', reviewsGiven: 0, commentsGiven: 1 }),
    ]);
    // avg reviewsGiven по активным (все трое вовлечены: comments>0) = (20+10+0)/3 = 10
    expect(buildProfileReviewStats(s, 'hi@x5.ru')!.reviewsGiven.standing).toBe('above');
    expect(buildProfileReviewStats(s, 'mid@x5.ru')!.reviewsGiven.standing).toBe('around');
    expect(buildProfileReviewStats(s, 'lo@x5.ru')!.reviewsGiven.standing).toBe('below');
  });

  it('baseline только по активным (спящие не занижают)', () => {
    const s = stats([
      author({ email: 'a@x5.ru', reviewsGiven: 10, commentsGiven: 2 }),
      author({ email: 'sleeper@x5.ru', reviewsGiven: 0, commentsGiven: 0 }), // неактивен
    ]);
    // avg по активным = 10 (sleeper исключён), значит a на уровне среднего
    const r = buildProfileReviewStats(s, 'a@x5.ru')!;
    expect(r.reviewsGiven.teamAvg).toBe(10);
    expect(r.reviewsGiven.standing).toBe('around');
    expect(r.activeReviewers).toBe(1);
  });

  it('ранг по вовлечённости', () => {
    const s = stats([
      author({ email: 'top@x5.ru', reviewsGiven: 30, commentsGiven: 10 }),
      author({ email: 'me@x5.ru', reviewsGiven: 5, commentsGiven: 5 }),
    ]);
    expect(buildProfileReviewStats(s, 'top@x5.ru')!.engagementRank).toBe(1);
    expect(buildProfileReviewStats(s, 'me@x5.ru')!.engagementRank).toBe(2);
  });
});
