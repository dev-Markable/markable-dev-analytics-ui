import type { UseQueryResult } from '@tanstack/react-query';
import { ApiError } from './api-error';
import { toApiError } from './problem-details';
import type { AsyncState } from './async-state';

/**
 * Адаптер из `useQuery` в `AsyncState<T>`. Сохраняет обратную совместимость
 * виджетов, которые ожидают наш собственный `AsyncState`:
 *
 * ```tsx
 * const q = useQuery(weeklyQuery({from, to}));
 * <WeeklyTable state={queryToAsyncState(q)} />
 * ```
 *
 * Маппинг:
 * - `isPending && !data` → `loading`
 * - `isError && !data`  → `error`
 * - `data != null`      → `success`
 * - иначе               → `idle`
 *
 * `lastFetchedAt` берётся из `dataUpdatedAt` (мс с epoch, 0 если не было
 * успешного фетча — нормализуем к `null`).
 */
export function queryToAsyncState<T>(q: UseQueryResult<T, unknown>): AsyncState<T> {
  const data = q.data ?? null;
  const error =
    q.error == null ? null : q.error instanceof ApiError ? q.error : toApiError(q.error);

  let status: AsyncState<T>['status'];
  if (q.isPending && data === null) status = 'loading';
  else if (q.isError && data === null) status = 'error';
  else if (data !== null) status = 'success';
  else status = 'idle';

  return {
    status,
    data,
    error,
    lastFetchedAt: q.dataUpdatedAt || null,
  };
}
