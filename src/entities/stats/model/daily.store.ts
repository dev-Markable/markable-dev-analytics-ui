import { create } from 'zustand';
import {
  ApiError,
  asyncFailure,
  asyncLoading,
  asyncSuccess,
  createRaceGuard,
  idleAsyncState,
  toApiError,
  type AsyncState,
} from '@/shared/api';
import { getDaily, type PeriodQuery } from '../api/stats.api';
import type { DailyStat } from './types';

interface DailyStore {
  state: AsyncState<DailyStat[]>;
  fetch: (query: PeriodQuery) => Promise<void>;
  reset: () => void;
}

const guard = createRaceGuard();

export const useDailyStore = create<DailyStore>((set) => ({
  state: idleAsyncState<DailyStat[]>(),

  fetch: async (query) => {
    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getDaily(query);
      if (!guard.isCurrent(requestId)) return;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      set((s) => ({ state: asyncFailure(s.state, error) }));
    }
  },

  reset: () => set({ state: idleAsyncState<DailyStat[]>() }),
}));
