import { describe, expect, it } from 'vitest';
import { summarizeCards } from './aggregate-cards';
import { makeCard } from '@/shared/test/factories';

describe('summarizeCards', () => {
  it('пустой → все нули', () => {
    const s = summarizeCards([]);
    expect(s.total).toBe(0);
    expect(s.active).toBe(0);
    expect(s.closed).toBe(0);
  });

  it('разбивает по closed и cardType', () => {
    const cards = [
      makeCard({ id: 1, closed: false, cardType: 'DEVELOPMENT' }),
      makeCard({ id: 2, closed: false, cardType: 'DEFECT' }),
      makeCard({ id: 3, closed: true, cardType: 'DEVELOPMENT' }),
      makeCard({ id: 4, closed: true, cardType: 'DEFECT' }),
      makeCard({ id: 5, closed: false, cardType: 'OTHER' }),
    ];
    const s = summarizeCards(cards);

    expect(s.total).toBe(5);
    expect(s.active).toBe(3); // 2 dev/defect + 1 other
    expect(s.closed).toBe(2);
    expect(s.activeDev).toBe(1);
    expect(s.activeDefect).toBe(1);
    expect(s.closedDev).toBe(1);
    expect(s.closedDefect).toBe(1);
  });

  it('OTHER не попадает в dev/defect счётчики, но идёт в total и active/closed', () => {
    const cards = [
      makeCard({ id: 1, closed: false, cardType: 'OTHER' }),
      makeCard({ id: 2, closed: true, cardType: 'OTHER' }),
    ];
    const s = summarizeCards(cards);
    expect(s.total).toBe(2);
    expect(s.active).toBe(1);
    expect(s.closed).toBe(1);
    expect(s.activeDev + s.activeDefect + s.closedDev + s.closedDefect).toBe(0);
  });
});
