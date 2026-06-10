import { useMemo } from 'react';
import { ApiError } from './api-error';
import { toApiError } from './problem-details';

/**
 * Маппит сырую ошибку из TanStack Query (или любую другую) в наш `ApiError`.
 * Возвращает null если ошибки нет.
 */
export function useApiError(error: unknown): ApiError | null {
  return useMemo(() => {
    if (error == null) return null;
    if (error instanceof ApiError) return error;
    return toApiError(error);
  }, [error]);
}
