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
import { getPerformanceReview } from '../api/performance.api';
import type { PerformanceReview, PerformanceQuery } from './types';

interface PerformanceStore {
  state: AsyncState<PerformanceReview>;
  fetch: (query: PerformanceQuery) => Promise<void>;
  reset: () => void;
}

const guard = createRaceGuard();
let lastKey: string | null = null;

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

    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getPerformanceReview(query);
      if (!guard.isCurrent(requestId)) return;
      lastKey = key;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      set((s) => ({ state: asyncFailure(s.state, e instanceof ApiError ? e : toApiError(e)) }));
    }
  },

  reset: () => {
    lastKey = null;
    set({ state: idleAsyncState<PerformanceReview>() });
  },
}));
