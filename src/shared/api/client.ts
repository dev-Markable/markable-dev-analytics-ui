import axios, { type AxiosError, type AxiosInstance } from 'axios';
import axiosRetry, { isNetworkError } from 'axios-retry';
import { env } from '@/shared/config';
import { toApiError } from './problem-details';

const MAX_RETRIES = 3;
/** Базовая задержка для экспоненциального backoff: 300 → 900 → 2100 мс. */
const BACKOFF_BASE_MS = 300;

/**
 * Когда повторять. Только идемпотентные GET'ы — `POST`/`PUT`/`DELETE`
 * не ретраим (могут породить дубль). Реакция на:
 * - network errors (потеря соединения, timeout, DNS);
 * - 5xx ответы (transient — бэк может перезапуститься/прогреться);
 * - 429 (rate limit) — стандартная практика, бэк сам скажет когда можно.
 *
 * 4xx (включая 404/400) НЕ ретраим — это устойчивые клиентские ошибки.
 */
function shouldRetry(error: AxiosError): boolean {
  if (error.config?.method?.toLowerCase() !== 'get') return false;
  if (isNetworkError(error)) return true;
  const status = error.response?.status;
  if (!status) return false;
  return status >= 500 || status === 429;
}

const createClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, application/problem+json',
    },
  });

  axiosRetry(instance, {
    retries: MAX_RETRIES,
    retryDelay: (count) => count * count * BACKOFF_BASE_MS,
    retryCondition: shouldRetry,
    // shouldResetTimeout: true — каждая попытка получает полный 30s timeout,
    // иначе после первой попытки клок не сбрасывается и шанс не успеть растёт.
    shouldResetTimeout: true,
  });

  // Маппинг RFC 7807 → ApiError делаем ПОСЛЕ axios-retry, чтобы retry-логика
  // ещё имела доступ к стандартному AxiosError (status/config), а не уже
  // преобразованному инстансу.
  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toApiError(error)),
  );

  return instance;
};

export const apiClient: AxiosInstance = createClient();
