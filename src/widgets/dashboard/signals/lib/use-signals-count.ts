import { useMemo } from 'react';
import type { AuthorActivity } from '@/entities/user';
import type { ReviewAuthor } from '@/entities/stats';
import { buildSignals } from './build-signals';

/** Число сигналов за период — для счётчика в шапке блока (сам список рисует SignalsList). */
export function useSignalsCount(
  current: readonly AuthorActivity[],
  previous: readonly AuthorActivity[],
  reviews: readonly ReviewAuthor[],
): number {
  return useMemo(
    () => buildSignals({ current, previous, reviews }).length,
    [current, previous, reviews],
  );
}
