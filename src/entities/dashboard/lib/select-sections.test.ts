import { describe, expect, it } from 'vitest';
import { isUnderperforming, selectDashboardSections } from './select-sections';
import { makeAuthor, makeAuthorWithCategory } from '@/shared/test/factories';

describe('isUnderperforming', () => {
  it('true для INACTIVE и BELOW_AVERAGE', () => {
    expect(isUnderperforming(makeAuthorWithCategory('a@x5.ru', 'INACTIVE', 0.1))).toBe(true);
    expect(isUnderperforming(makeAuthorWithCategory('b@x5.ru', 'BELOW_AVERAGE', 0.4))).toBe(true);
  });

  it('false для ACTIVE и STAR', () => {
    expect(isUnderperforming(makeAuthorWithCategory('c@x5.ru', 'ACTIVE', 1))).toBe(false);
    expect(isUnderperforming(makeAuthorWithCategory('d@x5.ru', 'STAR', 2))).toBe(false);
  });

  it('false если activity отсутствует', () => {
    expect(isUnderperforming(makeAuthor({ activity: null }))).toBe(false);
  });
});

describe('selectDashboardSections', () => {
  it('делит на дизъюнктные top и outsiders по категории', () => {
    const authors = [
      makeAuthorWithCategory('star@x5.ru', 'STAR', 2.0),
      makeAuthorWithCategory('active@x5.ru', 'ACTIVE', 1.0),
      makeAuthorWithCategory('below@x5.ru', 'BELOW_AVERAGE', 0.4),
      makeAuthorWithCategory('inactive@x5.ru', 'INACTIVE', 0.1),
    ];
    const { top, outsiders } = selectDashboardSections(authors, 10);

    expect(top.map((a) => a.email)).toEqual(['star@x5.ru', 'active@x5.ru']);
    expect(outsiders.map((a) => a.email)).toEqual(['below@x5.ru', 'inactive@x5.ru']);

    // Дизъюнктность: никто не в обоих
    const overlap = top.filter((t) => outsiders.some((o) => o.email === t.email));
    expect(overlap).toHaveLength(0);
  });

  it('outsiders в убывающем порядке score — как top, рейтинг монотонен', () => {
    const authors = [
      makeAuthorWithCategory('below@x5.ru', 'BELOW_AVERAGE', 0.5),
      makeAuthorWithCategory('inactive@x5.ru', 'INACTIVE', 0.05),
    ];
    const { outsiders } = selectDashboardSections(authors, 10);
    // Убывание, а не worst-first: список рендерится одним рейтингом
    // с продолжающейся нумерацией — номера позиций не должны врать.
    expect(outsiders.map((a) => a.email)).toEqual(['below@x5.ru', 'inactive@x5.ru']);
  });

  it('top ограничен maxN', () => {
    const authors = Array.from({ length: 15 }, (_, i) =>
      makeAuthorWithCategory(`a${i}@x5.ru`, 'ACTIVE', 1),
    );
    const { top } = selectDashboardSections(authors, 10);
    expect(top).toHaveLength(10);
  });

  it('outsiders ограничен maxN (берёт maxN самых низких)', () => {
    const authors = Array.from({ length: 15 }, (_, i) =>
      makeAuthorWithCategory(`a${i}@x5.ru`, 'INACTIVE', 0.1),
    );
    const { outsiders } = selectDashboardSections(authors, 10);
    expect(outsiders).toHaveLength(10);
  });

  it('авторы без activity идут в top (graceful fallback)', () => {
    const authors = [makeAuthor({ email: 'noactivity@x5.ru', activity: null })];
    const { top, outsiders } = selectDashboardSections(authors, 10);
    expect(top.map((a) => a.email)).toEqual(['noactivity@x5.ru']);
    expect(outsiders).toHaveLength(0);
  });

  it('пустой вход → пустые секции', () => {
    expect(selectDashboardSections([], 10)).toEqual({ top: [], outsiders: [] });
  });
});
