import { describe, expect, it } from 'vitest';
import type { ReviewAuthor } from '@/entities/stats';
import {
  computeConcentration,
  giniCoefficient,
  lorenzCurve,
  reviewBusFactor,
  topShare,
} from './concentration';

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

describe('giniCoefficient', () => {
  it('пусто / нули → 0', () => {
    expect(giniCoefficient([])).toBe(0);
    expect(giniCoefficient([0, 0])).toBe(0);
  });
  it('равенство → 0', () => {
    expect(giniCoefficient([5, 5, 5, 5])).toBeCloseTo(0, 5);
  });
  it('перекос больше равномерного', () => {
    expect(giniCoefficient([1, 1, 1, 17])).toBeGreaterThan(giniCoefficient([4, 5, 5, 6]));
  });
});

describe('topShare', () => {
  it('нули → 0', () => {
    expect(topShare([0, 0], 3)).toBe(0);
  });
  it('топ-2 из четырёх', () => {
    expect(topShare([40, 30, 20, 10], 2)).toBeCloseTo(0.7, 5);
  });
});

describe('reviewBusFactor', () => {
  it('нет approve → 0', () => {
    expect(reviewBusFactor([0, 0])).toBe(0);
  });
  it('один тащит >50% → 1 (риск)', () => {
    expect(reviewBusFactor([60, 10, 10, 10, 10])).toBe(1);
  });
  it('двое нужны для >50%', () => {
    // 30+30=60 > 50% от 100
    expect(reviewBusFactor([30, 30, 20, 20])).toBe(2);
  });
  it('равномерно распределено → больше', () => {
    expect(reviewBusFactor([10, 10, 10, 10, 10, 10])).toBeGreaterThanOrEqual(3);
  });
});

describe('lorenzCurve', () => {
  it('пусто → одна точка (0,0)', () => {
    expect(lorenzCurve([])).toEqual([{ x: 0, y: 0 }]);
  });
  it('начинается с (0,0), заканчивается (1,1)', () => {
    const pts = lorenzCurve([1, 2, 3, 4]);
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[pts.length - 1]).toEqual({ x: 1, y: 1 });
  });
  it('равенство → диагональ', () => {
    const pts = lorenzCurve([5, 5]);
    expect(pts).toEqual([
      { x: 0, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 1 },
    ]);
  });
});

describe('computeConcentration', () => {
  it('нет активных ревьюеров → null', () => {
    expect(computeConcentration([author({}), author({ reviewsReceived: 5 })])).toBeNull();
  });

  it('считает агрегаты по approve, received игнорируется', () => {
    const stats = computeConcentration([
      author({ email: 'a@x5.ru', reviewsGiven: 60, reviewsReceived: 100 }),
      author({ email: 'b@x5.ru', reviewsGiven: 10 }),
      author({ email: 'c@x5.ru', reviewsGiven: 10 }),
      author({ email: 'd@x5.ru', reviewsGiven: 0, reviewsReceived: 50 }),
    ])!;
    expect(stats.activeReviewers).toBe(3); // d не считается
    expect(stats.totalApprove).toBe(80);
    expect(stats.busFactor).toBe(1); // a один даёт >50%
    expect(stats.riskLevel).toBe('high');
    expect(stats.topShareValue).toBeCloseTo(60 / 80, 5);
  });
});
