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
import { getPerformanceReview } from '../api/performance.api';
import type { PerformanceReview, PerformanceQuery } from './types';

interface PerformanceStore {
  state: AsyncState<PerformanceReview>;
  fetch: (query: PerformanceQuery) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

const guard = createRaceGuard();
let lastKey: string | null = null;
let currentAbort: AbortController | null = null;

const keyOf = (q: PerformanceQuery): string =>
  `${q.email}|${q.from}|${q.to}|${q.compareToPrevious}`;

export const usePerformanceStore = create<PerformanceStore>((set, get) => ({
  state: idleAsyncState<PerformanceReview>(),

  fetch: async (query) => {
    const key = keyOf(query);
    const current = get().state;
    if (current.status === 'success' && lastKey === key && isFresh(current, STORE_CACHE_TTL_MS)) {
      return;
    }

    currentAbort?.abort();
    const abort = new AbortController();
    currentAbort = abort;

    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getPerformanceReview(query, abort.signal);
      if (!guard.isCurrent(requestId)) return;
      lastKey = key;
      currentAbort = null;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      if (isAbortError(e)) return;
      set((s) => ({ state: asyncFailure(s.state, e instanceof ApiError ? e : toApiError(e)) }));
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
    set({ state: idleAsyncState<PerformanceReview>() });
  },
}));
