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
import { getDashboard } from '../api/dashboard.api';
import type { DashboardData, DashboardPeriod } from './types';

interface DashboardStore {
  /**
   * Полный paginated-ответ от бэка (size=500). Все срезы — top, outsiders,
   * таблица, totals — вычисляются на клиенте, чтобы team-filter корректно
   * пересчитывал агрегации без дополнительных запросов.
   */
  state: AsyncState<DashboardData>;
  fetch: (period: DashboardPeriod) => Promise<void>;
  reset: () => void;
}

const guard = createRaceGuard();

export const useDashboardStore = create<DashboardStore>((set) => ({
  state: idleAsyncState<DashboardData>(),

  fetch: async (period) => {
    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getDashboard(period);
      if (!guard.isCurrent(requestId)) return;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      set((s) => ({ state: asyncFailure(s.state, error) }));
    }
  },

  reset: () => set({ state: idleAsyncState<DashboardData>() }),
}));
