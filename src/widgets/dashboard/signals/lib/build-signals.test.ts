import { describe, expect, it } from 'vitest';
import { makeAuthor, makeActivity } from '@/shared/test/factories';
import type { ReviewAuthor } from '@/entities/stats';
import { buildSignals } from './build-signals';

const reviewer = (over: Partial<ReviewAuthor>): ReviewAuthor => ({
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

describe('buildSignals — падение активности', () => {
  it('падение ≥60% → high, ≥40% → medium', () => {
    const previous = [
      makeAuthor({ email: 'big@x5.ru', activity: makeActivity({ score: 1.0 }) }),
      makeAuthor({ email: 'mid@x5.ru', activity: makeActivity({ score: 1.0 }) }),
    ];
    const current = [
      makeAuthor({ email: 'big@x5.ru', activity: makeActivity({ score: 0.3 }) }), // −70%
      makeAuthor({ email: 'mid@x5.ru', activity: makeActivity({ score: 0.55 }) }), // −45%
    ];
    const signals = buildSignals({ current, previous, reviews: [] });
    const big = signals.find((s) => s.email === 'big@x5.ru')!;
    const mid = signals.find((s) => s.email === 'mid@x5.ru')!;
    expect(big.severity).toBe('high');
    expect(mid.severity).toBe('medium');
  });

  it('игнорирует падение с низкой базы (шум малых чисел)', () => {
    const previous = [makeAuthor({ email: 'x@x5.ru', activity: makeActivity({ score: 0.3 }) })];
    const current = [makeAuthor({ email: 'x@x5.ru', activity: makeActivity({ score: 0.05 }) })];
    expect(buildSignals({ current, previous, reviews: [] })).toHaveLength(0);
  });

  it('нет прошлого периода → нет сигнала падения', () => {
    const current = [makeAuthor({ email: 'x@x5.ru', activity: makeActivity({ score: 0.1 }) })];
    expect(buildSignals({ current, previous: [], reviews: [] })).toHaveLength(0);
  });
});

describe('buildSignals — устойчиво низкая активность', () => {
  const low = (email: string, category: 'INACTIVE' | 'BELOW_AVERAGE', score: number) =>
    makeAuthor({ email, activity: makeActivity({ category, score }) });

  it('ниже среднего оба периода → medium (без спада activityDrop не ловит)', () => {
    const previous = [low('x@x5.ru', 'BELOW_AVERAGE', 0.35)];
    const current = [low('x@x5.ru', 'BELOW_AVERAGE', 0.33)];
    const signals = buildSignals({ current, previous, reviews: [] });
    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({ kind: 'sustained-low', severity: 'medium', email: 'x@x5.ru' });
  });

  it('неактивен оба периода → high', () => {
    const previous = [low('z@x5.ru', 'INACTIVE', 0.1)];
    const current = [low('z@x5.ru', 'INACTIVE', 0.1)];
    expect(buildSignals({ current, previous, reviews: [] })[0]!.severity).toBe('high');
  });

  it('был активен, стал низким → НЕ устойчивый (это уже про спад, не про хроника)', () => {
    const previous = [makeAuthor({ email: 'a@x5.ru', activity: makeActivity({ category: 'ACTIVE', score: 1 }) })];
    const current = [low('a@x5.ru', 'BELOW_AVERAGE', 0.35)];
    const sustained = buildSignals({ current, previous, reviews: [] }).filter(
      (s) => s.kind === 'sustained-low',
    );
    expect(sustained).toHaveLength(0);
  });

  it('низкий сейчас, но нет прошлого периода → нет сигнала', () => {
    const current = [low('b@x5.ru', 'INACTIVE', 0.1)];
    expect(buildSignals({ current, previous: [], reviews: [] })).toHaveLength(0);
  });
});

describe('buildSignals — MR без ревью', () => {
  it('mergedMrCount>0 и reviewsReceived=0 → medium', () => {
    const reviews = [reviewer({ email: 'solo@x5.ru', mergedMrCount: 4, reviewsReceived: 0 })];
    const signals = buildSignals({ current: [], previous: [], reviews });
    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({ kind: 'unreviewed', severity: 'medium', email: 'solo@x5.ru' });
  });

  it('если ревью получены — сигнала нет', () => {
    const reviews = [reviewer({ email: 'ok@x5.ru', mergedMrCount: 4, reviewsReceived: 3 })];
    expect(buildSignals({ current: [], previous: [], reviews })).toHaveLength(0);
  });
});

describe('buildSignals — концентрация ревью', () => {
  it('топ-ревьюер >50% при ≥3 ревьюерах → high', () => {
    const reviews = [
      reviewer({ email: 'hero@x5.ru', reviewsGiven: 60 }),
      reviewer({ email: 'b@x5.ru', reviewsGiven: 10 }),
      reviewer({ email: 'c@x5.ru', reviewsGiven: 10 }),
    ];
    const signals = buildSignals({ current: [], previous: [], reviews });
    const conc = signals.find((s) => s.kind === 'review-concentration')!;
    expect(conc.severity).toBe('high');
    expect(conc.detail).toContain('75%');
  });

  it('меньше 3 ревьюеров → нет сигнала', () => {
    const reviews = [
      reviewer({ email: 'a@x5.ru', reviewsGiven: 60 }),
      reviewer({ email: 'b@x5.ru', reviewsGiven: 1 }),
    ];
    expect(
      buildSignals({ current: [], previous: [], reviews }).filter(
        (s) => s.kind === 'review-concentration',
      ),
    ).toHaveLength(0);
  });
});

describe('buildSignals — сортировка', () => {
  it('high идёт раньше medium', () => {
    const previous = [makeAuthor({ email: 'd@x5.ru', activity: makeActivity({ score: 1 }) })];
    const current = [makeAuthor({ email: 'd@x5.ru', activity: makeActivity({ score: 0.3 }) })];
    const reviews = [reviewer({ email: 'u@x5.ru', mergedMrCount: 2, reviewsReceived: 0 })];
    const sev = buildSignals({ current, previous, reviews }).map((s) => s.severity);
    expect(sev[0]).toBe('high');
    // ни один medium не стоит раньше какого-либо high
    const firstMedium = sev.indexOf('medium');
    const lastHigh = sev.lastIndexOf('high');
    expect(firstMedium).toBeGreaterThan(lastHigh);
  });
});
