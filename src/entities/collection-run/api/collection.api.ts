import { ApiError, apiClient } from '@/shared/api';
import type {
  CollectionRun,
  KaitenSyncResult,
  TriggerCollectionPayload,
} from '../model/types';

/**
 * Бэк синхронен — POST не возвращается, пока цикл не завершён.
 * На фронте поднимаем таймаут до 5 минут (по умолчанию у клиента 30 сек).
 */
const COLLECTION_TIMEOUT_MS = 5 * 60 * 1000;
const KAITEN_SYNC_TIMEOUT_MS = 60 * 1000;

export async function triggerCollection(
  payload: TriggerCollectionPayload = {},
): Promise<CollectionRun> {
  const body = payload.since ? { since: payload.since } : {};
  const { data } = await apiClient.post<CollectionRun>('/collection/runs', body, {
    timeout: COLLECTION_TIMEOUT_MS,
  });
  return data;
}

/**
 * Самый свежий прогон по `startedAt`. Так как сбор single-flight, идущий прогон —
 * всегда самый свежий: эндпоинт отдаёт либо текущий RUNNING (для poll + cancel),
 * либо последний терминальный результат. `404` = ни одного прогона ещё не было →
 * нормальное пустое состояние, маппим в `null` (не ошибка).
 */
export async function getLatestRun(): Promise<CollectionRun | null> {
  try {
    const { data } = await apiClient.get<CollectionRun>('/collection/runs/latest');
    return data;
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) return null;
    throw e;
  }
}

/**
 * Кооперативная отмена. Бэк отвечает `202` с прогоном всё ещё в `RUNNING`
 * (флаг отмены поднят) — фактический переход в `CANCELLED` наблюдаем поллингом.
 * `409` (терминальный прогон) / `404` (нет прогона) приходят как `ApiError`.
 */
export async function cancelCollectionRun(id: string): Promise<CollectionRun> {
  const { data } = await apiClient.post<CollectionRun>(
    `/collection/runs/${encodeURIComponent(id)}/cancel`,
  );
  return data;
}

export async function syncKaitenUsers(): Promise<KaitenSyncResult> {
  const { data } = await apiClient.post<KaitenSyncResult>(
    '/kaiten/sync-users',
    {},
    { timeout: KAITEN_SYNC_TIMEOUT_MS },
  );
  return data;
}
