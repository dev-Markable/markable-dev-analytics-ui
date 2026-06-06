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
import { previousPeriod } from '@/shared/lib';
import { STORE_CACHE_TTL_MS } from '@/shared/config';
import { getDashboard } from '../api/dashboard.api';
import type { DashboardData, DashboardPeriod } from './types';

interface DashboardStore {
  /**
   * Полный paginated-ответ за текущий период (size=500). Все срезы — top,
   * outsiders, таблица, totals — вычисляются на клиенте, чтобы клиентский
   * скоп команды пересчитывал агрегации без дополнительных запросов.
   */
  state: AsyncState<DashboardData>;
  /**
   * Тот же ответ за предыдущий период той же длины — для period-over-period
   * дельт в метрик-тайлах. Грузится параллельно с основным.
   */
  prev: AsyncState<DashboardData>;
  fetch: (period: DashboardPeriod) => Promise<void>;
  /** Отменить inflight-запрос (используется при unmount). */
  cancel: () => void;
  reset: () => void;
}

const guard = createRaceGuard();
// Ключ последней успешной загрузки — для TTL-кэша при возврате на страницу.
let lastKey: string | null = null;
// Контроллер inflight-запроса. Новый fetch гасит предыдущий, чтобы устаревший
// тяжёлый /dashboard?size=500 не висел в сети при быстрой смене периода.
let currentAbort: AbortController | null = null;

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  state: idleAsyncState<DashboardData>(),
  prev: idleAsyncState<DashboardData>(),

  fetch: async (period) => {
    const key = `${period.from}|${period.to}`;
    const current = get().state;
    // Свежие данные за тот же период — не дёргаем API повторно.
    if (current.status === 'success' && lastKey === key && isFresh(current, STORE_CACHE_TTL_MS)) {
      return;
    }

    currentAbort?.abort();
    const abort = new AbortController();
    currentAbort = abort;

    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state), prev: asyncLoading(s.prev) }));
    try {
      const [data, prevData] = await Promise.all([
        getDashboard(period, abort.signal),
        getDashboard(previousPeriod(period), abort.signal),
      ]);
      if (!guard.isCurrent(requestId)) return;
      lastKey = key;
      currentAbort = null;
      set({ state: asyncSuccess(data), prev: asyncSuccess(prevData) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      if (isAbortError(e)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      // Дельты — вторичны: если упал основной, показываем ошибку основного.
      // prev-фейл не критичен, но помечаем тоже, чтобы UI не ждал.
      set((s) => ({
        state: asyncFailure(s.state, error),
        prev: asyncFailure(s.prev, error),
      }));
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
    set({
      state: idleAsyncState<DashboardData>(),
      prev: idleAsyncState<DashboardData>(),
    });
  },
}));
