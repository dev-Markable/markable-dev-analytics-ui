import type { ApiError } from './api-error';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: ApiError | null;
  lastFetchedAt: number | null;
}

export const idleAsyncState = <T>(): AsyncState<T> => ({
  data: null,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
});

export const asyncLoading = <T>(prev: AsyncState<T>): AsyncState<T> => ({
  ...prev,
  status: 'loading',
  error: null,
});

export const asyncSuccess = <T>(data: T): AsyncState<T> => ({
  data,
  status: 'success',
  error: null,
  lastFetchedAt: Date.now(),
});

export const asyncFailure = <T>(prev: AsyncState<T>, error: ApiError): AsyncState<T> => ({
  ...prev,
  status: 'error',
  error,
});

export const isFresh = (state: AsyncState<unknown>, withinMs: number): boolean =>
  state.lastFetchedAt != null && Date.now() - state.lastFetchedAt < withinMs;
