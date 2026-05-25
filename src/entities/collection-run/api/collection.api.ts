import { apiClient } from '@/shared/api';
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

export async function getCollectionRun(id: string): Promise<CollectionRun> {
  const { data } = await apiClient.get<CollectionRun>(
    `/collection/runs/${encodeURIComponent(id)}`,
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
