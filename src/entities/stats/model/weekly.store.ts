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
import { getWeekly, type PeriodQuery } from '../api/stats.api';
import type { WeeklyStat } from './types';

interface WeeklyStore {
  state: AsyncState<WeeklyStat[]>;
  fetch: (query: PeriodQuery) => Promise<void>;
  reset: () => void;
}

const guard = createRaceGuard();

export const useWeeklyStore = create<WeeklyStore>((set) => ({
  state: idleAsyncState<WeeklyStat[]>(),

  fetch: async (query) => {
    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getWeekly(query);
      if (!guard.isCurrent(requestId)) return;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      set((s) => ({ state: asyncFailure(s.state, error) }));
    }
  },

  reset: () => set({ state: idleAsyncState<WeeklyStat[]>() }),
}));
