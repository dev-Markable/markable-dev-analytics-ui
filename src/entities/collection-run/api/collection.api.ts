import { ApiError, apiClient } from '@/shared/api';
import type {
  CollectionRun,
  KaitenSyncResult,
  TriggerCollectionPayload,
} from '../model/types';

const KAITEN_SYNC_TIMEOUT_MS = 60 * 1000;

/**
 * Запуск сбора. Бэк асинхронен (202): сразу отдаёт прогон в `RUNNING`, цикл идёт
 * в фоне. Финальный статус наблюдаем поллингом GET /runs/{id} | /latest
 * (RUNNING → SUCCESS/FAILED/CANCELLED). Поэтому дефолтного таймаута клиента
 * достаточно — длинный 5-минутный override больше не нужен.
 */
export async function triggerCollection(
  payload: TriggerCollectionPayload = {},
): Promise<CollectionRun> {
  const body = payload.since ? { since: payload.since } : {};
  const { data } = await apiClient.post<CollectionRun>('/collection/runs', body);
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
