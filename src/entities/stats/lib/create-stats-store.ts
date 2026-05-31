import { create } from 'zustand';
import {
  ApiError,
  asyncFailure,
  asyncLoading,
  asyncSuccess,
  createRaceGuard,
  idleAsyncState,
  isFresh,
  toApiError,
  type AsyncState,
} from '@/shared/api';
import { STORE_CACHE_TTL_MS } from '@/shared/config';
import type { PeriodQuery } from '../api/stats.api';

export interface PeriodStore<T> {
  state: AsyncState<T>;
  fetch: (query: PeriodQuery) => Promise<void>;
  reset: () => void;
}

/**
 * Фабрика стора для period-эндпоинтов (`{from, to}` → `T`).
 *
 * Общая для weekly / daily / summary логика:
 * - race-guard (отмена устаревших ответов при смене периода),
 * - TTL-кэш: повторный `fetch` за тот же период в пределах TTL — no-op
 *   (не передёргиваем API при возврате на страницу).
 */
export function createStatsStore<T>(fetcher: (query: PeriodQuery) => Promise<T>) {
  const guard = createRaceGuard();
  let lastKey: string | null = null;

  return create<PeriodStore<T>>((set, get) => ({
    state: idleAsyncState<T>(),

    fetch: async (query) => {
      const key = `${query.from}|${query.to}`;
      const current = get().state;
      if (current.status === 'success' && lastKey === key && isFresh(current, STORE_CACHE_TTL_MS)) {
        return;
      }

      const requestId = guard.next();
      set((s) => ({ state: asyncLoading(s.state) }));
      try {
        const data = await fetcher(query);
        if (!guard.isCurrent(requestId)) return;
        lastKey = key;
        set({ state: asyncSuccess(data) });
      } catch (e) {
        if (!guard.isCurrent(requestId)) return;
        const error = e instanceof ApiError ? e : toApiError(e);
        set((s) => ({ state: asyncFailure(s.state, error) }));
      }
    },

    reset: () => {
      lastKey = null;
      set({ state: idleAsyncState<T>() });
    },
  }));
}
