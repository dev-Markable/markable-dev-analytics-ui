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
  /** Первая страница (page=0) — самые активные. */
  topPage: AsyncState<DashboardData>;
  /** Последняя страница (page=totalPages-1) — аутсайдеры. */
  outsidersPage: AsyncState<DashboardData>;
  /** Текущая страница пагинируемой таблицы «Все авторы». */
  tablePage: AsyncState<DashboardData>;

  /** Атомарно фетчит top + outsiders + начальную страницу таблицы. */
  fetch: (period: DashboardPeriod, pageSize?: number) => Promise<void>;
  /** Переключает страницу таблицы — top/outsiders не дёргает. */
  goToTablePage: (
    period: DashboardPeriod,
    page: number,
    pageSize?: number,
  ) => Promise<void>;
  reset: () => void;
}

const summaryGuard = createRaceGuard();
const tableGuard = createRaceGuard();

const DEFAULT_TOP_OUTSIDER_SIZE = 10;
const DEFAULT_TABLE_PAGE_SIZE = 20;

const fetchTopAndOutsiders = async (
  period: DashboardPeriod,
  pageSize: number,
): Promise<{ top: DashboardData; outsiders: DashboardData | null }> => {
  const top = await getDashboard({ ...period, page: 0, size: pageSize });
  if (top.totalPages <= 1) {
    return { top, outsiders: null };
  }
  const outsiders = await getDashboard({
    ...period,
    page: top.totalPages - 1,
    size: pageSize,
  });
  return { top, outsiders };
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  topPage: idleAsyncState<DashboardData>(),
  outsidersPage: idleAsyncState<DashboardData>(),
  tablePage: idleAsyncState<DashboardData>(),

  fetch: async (period, pageSize = DEFAULT_TOP_OUTSIDER_SIZE) => {
    const summaryReqId = summaryGuard.next();
    const tableReqId = tableGuard.next();

    set((s) => ({
      topPage: asyncLoading(s.topPage),
      outsidersPage: asyncLoading(s.outsidersPage),
      tablePage: asyncLoading(s.tablePage),
    }));

    try {
      const [{ top, outsiders }, initialTable] = await Promise.all([
        fetchTopAndOutsiders(period, pageSize),
        getDashboard({ ...period, page: 0, size: DEFAULT_TABLE_PAGE_SIZE }),
      ]);

      if (summaryGuard.isCurrent(summaryReqId)) {
        set({
          topPage: asyncSuccess(top),
          outsidersPage: outsiders
            ? asyncSuccess(outsiders)
            : asyncSuccess({ ...top, items: [] }),
        });
      }

      if (tableGuard.isCurrent(tableReqId)) {
        set({ tablePage: asyncSuccess(initialTable) });
      }
    } catch (e) {
      const error = e instanceof ApiError ? e : toApiError(e);
      if (summaryGuard.isCurrent(summaryReqId)) {
        set((s) => ({
          topPage: asyncFailure(s.topPage, error),
          outsidersPage: asyncFailure(s.outsidersPage, error),
        }));
      }
      if (tableGuard.isCurrent(tableReqId)) {
        set((s) => ({ tablePage: asyncFailure(s.tablePage, error) }));
      }
    }
  },

  goToTablePage: async (period, page, pageSize = DEFAULT_TABLE_PAGE_SIZE) => {
    const requestId = tableGuard.next();
    set((s) => ({ tablePage: asyncLoading(s.tablePage) }));
    try {
      const data = await getDashboard({ ...period, page, size: pageSize });
      if (!tableGuard.isCurrent(requestId)) return;
      set({ tablePage: asyncSuccess(data) });
    } catch (e) {
      if (!tableGuard.isCurrent(requestId)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      set((s) => ({ tablePage: asyncFailure(s.tablePage, error) }));
    }
  },

  reset: () =>
    set({
      topPage: idleAsyncState<DashboardData>(),
      outsidersPage: idleAsyncState<DashboardData>(),
      tablePage: idleAsyncState<DashboardData>(),
    }),
}));
