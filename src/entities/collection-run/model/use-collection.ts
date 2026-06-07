import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api';
import {
  getCollectionRun,
  syncKaitenUsers,
  triggerCollection,
} from '../api/collection.api';
import type { CollectionRun, KaitenSyncResult } from './types';

/**
 * «Последний прогон, который пользователь видел в этой сессии» — это не
 * серверный ресурс с фиксированным URL (нет эндпоинта «дай последний прогон»),
 * а результат мутации `trigger`/`refresh`. Чтобы он был виден из CurrentRunCard,
 * хотя триггерит его соседний CollectionTriggerCard, держим его в кэше Query
 * под стабильным ключом: мутации пишут через `setQueryData`, карточка читает
 * через `useCurrentRun`. Сам этот «query» никогда не фетчит (`enabled: false`).
 */
const CURRENT_RUN_KEY = ['collection', 'current-run'] as const;

/** Ключ мутации сбора — по нему CurrentRunCard через `useIsMutating` узнаёт,
 *  что прямо сейчас идёт цикл (триггерится из другого виджета). */
export const TRIGGER_MUTATION_KEY = ['collection', 'trigger'] as const;

export function useCurrentRun() {
  return useQuery<CollectionRun | null>({
    queryKey: CURRENT_RUN_KEY,
    queryFn: () => null,
    enabled: false,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useTriggerCollection() {
  const qc = useQueryClient();
  return useMutation<CollectionRun, ApiError, string | undefined>({
    mutationKey: TRIGGER_MUTATION_KEY,
    mutationFn: (since) => triggerCollection(since ? { since } : {}),
    onSuccess: (run) => qc.setQueryData(CURRENT_RUN_KEY, run),
  });
}

export function useRefreshRun() {
  const qc = useQueryClient();
  return useMutation<CollectionRun, ApiError, string>({
    mutationFn: (id) => getCollectionRun(id),
    onSuccess: (run) => qc.setQueryData(CURRENT_RUN_KEY, run),
  });
}

export function useSyncKaiten() {
  return useMutation<KaitenSyncResult, ApiError, void>({
    mutationFn: () => syncKaitenUsers(),
  });
}
