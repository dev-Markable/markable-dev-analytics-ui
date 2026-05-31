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
import { previousPeriod } from '@/shared/lib';
import { getDashboard } from '../api/dashboard.api';
import type { DashboardData, DashboardPeriod } from './types';

interface DashboardStore {
  /**
   * Полный paginated-ответ за текущий период (size=500). Все срезы — top,
   * outsiders, таблица, totals — вычисляются на клиенте, чтобы team-filter
   * корректно пересчитывал агрегации без дополнительных запросов.
   */
  state: AsyncState<DashboardData>;
  /**
   * Тот же ответ за предыдущий период той же длины — для period-over-period
   * дельт в метрик-тайлах. Грузится параллельно с основным.
   */
  prev: AsyncState<DashboardData>;
  fetch: (period: DashboardPeriod) => Promise<void>;
  reset: () => void;
}

const guard = createRaceGuard();

export const useDashboardStore = create<DashboardStore>((set) => ({
  state: idleAsyncState<DashboardData>(),
  prev: idleAsyncState<DashboardData>(),

  fetch: async (period) => {
    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state), prev: asyncLoading(s.prev) }));
    try {
      const [data, prevData] = await Promise.all([
        getDashboard(period),
        getDashboard(previousPeriod(period)),
      ]);
      if (!guard.isCurrent(requestId)) return;
      set({ state: asyncSuccess(data), prev: asyncSuccess(prevData) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      // Дельты — вторичны: если упал основной, показываем ошибку основного.
      // prev-фейл не критичен, но помечаем тоже, чтобы UI не ждал.
      set((s) => ({
        state: asyncFailure(s.state, error),
        prev: asyncFailure(s.prev, error),
      }));
    }
  },

  reset: () =>
    set({
      state: idleAsyncState<DashboardData>(),
      prev: idleAsyncState<DashboardData>(),
    }),
}));
