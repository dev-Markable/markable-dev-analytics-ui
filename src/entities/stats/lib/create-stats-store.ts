import { create } from 'zustand';
import {
  ApiError,
  asyncFailure,
  asyncLoading,
  asyncSuccess,
  createRaceGuard,
  idleAsyncState,
  isAbortError,
  isFresh,
  toApiError,
  type AsyncState,
} from '@/shared/api';
import { STORE_CACHE_TTL_MS } from '@/shared/config';
import type { PeriodQuery } from '../api/stats.api';

export interface PeriodStore<T> {
  state: AsyncState<T>;
  fetch: (query: PeriodQuery) => Promise<void>;
  /** Отменить inflight-запрос (используется при unmount страницы). */
  cancel: () => void;
  reset: () => void;
}

/**
 * Фабрика стора для period-эндпоинтов (`{from, to}` → `T`).
 *
 * Общая для weekly / daily / summary / hourly / reviews логика:
 * - race-guard (отмена устаревших ответов при смене периода);
 * - AbortController — каждая новая `fetch`-вызов сначала отменяет предыдущий,
 *   чтобы старый запрос не платил трафик и не нагружал бэк;
 * - TTL-кэш: повторный `fetch` за тот же период в пределах TTL — no-op
 *   (не передёргиваем API при возврате на страницу);
 * - отменённые ошибки не записываются в state как failure.
 */
export function createStatsStore<T>(
  fetcher: (query: PeriodQuery, signal?: AbortSignal) => Promise<T>,
) {
  const guard = createRaceGuard();
  let lastKey: string | null = null;
  let currentAbort: AbortController | null = null;

  return create<PeriodStore<T>>((set, get) => ({
    state: idleAsyncState<T>(),

    fetch: async (query) => {
      const key = `${query.from}|${query.to}`;
      const current = get().state;
      if (current.status === 'success' && lastKey === key && isFresh(current, STORE_CACHE_TTL_MS)) {
        return;
      }

      // Гасим предыдущий запрос (если есть): экономим трафик и нагрузку бэка.
      currentAbort?.abort();
      const abort = new AbortController();
      currentAbort = abort;

      const requestId = guard.next();
      set((s) => ({ state: asyncLoading(s.state) }));
      try {
        const data = await fetcher(query, abort.signal);
        if (!guard.isCurrent(requestId)) return;
        lastKey = key;
        currentAbort = null;
        set({ state: asyncSuccess(data) });
      } catch (e) {
        if (!guard.isCurrent(requestId)) return;
        if (isAbortError(e)) return; // тихо игнорируем отмену
        const error = e instanceof ApiError ? e : toApiError(e);
        set((s) => ({ state: asyncFailure(s.state, error) }));
      }
    },

    cancel: () => {
      currentAbort?.abort();
      currentAbort = null;
    },

    reset: () => {
      lastKey = null;
      currentAbort?.abort();
      currentAbort = null;
      set({ state: idleAsyncState<T>() });
    },
  }));
}
