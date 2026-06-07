import type { ApiError } from './api-error';

/**
 * Унифицированный shape async-данных для виджетов. После миграции на TanStack
 * Query он строится адаптером `queryToAsyncState` из `UseQueryResult`, а не
 * руками — императивные хелперы (asyncLoading/Success/Failure) удалены вместе
 * с последним Zustand-data-стором. Тип остаётся как контракт пропсов виджетов.
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: ApiError | null;
  lastFetchedAt: number | null;
}
