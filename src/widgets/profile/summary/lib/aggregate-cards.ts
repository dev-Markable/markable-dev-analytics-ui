import type { KaitenCard } from '@/entities/kaiten-card';

export interface CardSummary {
  total: number;
  active: number;
  closed: number;
  activeDev: number;
  activeDefect: number;
  closedDev: number;
  closedDefect: number;
}

const EMPTY: CardSummary = {
  total: 0,
  active: 0,
  closed: 0,
  activeDev: 0,
  activeDefect: 0,
  closedDev: 0,
  closedDefect: 0,
};

/**
 * Считает счётчики карточек за один проход. Разбивает по `closed` (источник правды
 * от бэка) и по `cardType` — DEVELOPMENT и DEFECT отдельно, OTHER идёт только в total.
 */
export function summarizeCards(cards: readonly KaitenCard[]): CardSummary {
  if (cards.length === 0) return EMPTY;

  const acc: CardSummary = { ...EMPTY, total: cards.length };
  for (const c of cards) {
    if (c.closed) {
      acc.closed += 1;
      if (c.cardType === 'DEVELOPMENT') acc.closedDev += 1;
      else if (c.cardType === 'DEFECT') acc.closedDefect += 1;
    } else {
      acc.active += 1;
      if (c.cardType === 'DEVELOPMENT') acc.activeDev += 1;
      else if (c.cardType === 'DEFECT') acc.activeDefect += 1;
    }
  }
  return acc;
}
