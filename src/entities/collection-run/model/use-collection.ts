import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { ApiError } from '@/shared/api';
import {
  cancelCollectionRun,
  getLatestRun,
  syncKaitenUsers,
  triggerCollection,
} from '../api/collection.api';
import type { CollectionRun, KaitenSyncResult } from './types';

/** Кэш «самого свежего прогона» — общий для всех виджетов collection. */
const LATEST_RUN_KEY = ['collection', 'latest'] as const;

/** Ключ мутации сбора — по нему виджеты через `useIsMutating` узнают,
 *  что прямо сейчас идёт цикл (триггерится из соседнего виджета). */
export const TRIGGER_MUTATION_KEY = ['collection', 'trigger'] as const;

/** Частота опроса статуса, пока прогон активен. */
const RUN_POLL_INTERVAL_MS = 3000;

/**
 * Самый свежий прогон (он же — идущий, т.к. сбор single-flight).
 *
 * Поллим, пока:
 * - прогон в `RUNNING` (наблюдаем переход к терминалу, в т.ч. RUNNING → CANCELLED), либо
 * - висит сам синхронный POST `trigger`: его прогон ещё не «виден» как RUNNING
 *   (строка появляется в начале цикла), и без этого условия poll не запустился бы.
 *
 * На монтировании экрана делает обычный GET — поэтому идущий сбор, запущенный
 * из другой вкладки / другим оператором, тут же подхватывается (id для cancel).
 */
export function useLatestRun() {
  const triggering = useIsMutating({ mutationKey: TRIGGER_MUTATION_KEY }) > 0;
  return useQuery<CollectionRun | null, ApiError>({
    queryKey: LATEST_RUN_KEY,
    queryFn: getLatestRun,
    refetchInterval: (query) => {
      if (query.state.data?.status === 'RUNNING') return RUN_POLL_INTERVAL_MS;
      return triggering ? RUN_POLL_INTERVAL_MS : false;
    },
    staleTime: 0,
  });
}

export function useTriggerCollection() {
  const qc = useQueryClient();
  return useMutation<CollectionRun, ApiError, string | undefined>({
    mutationKey: TRIGGER_MUTATION_KEY,
    mutationFn: (since) => triggerCollection(since ? { since } : {}),
    onSuccess: (run) => qc.setQueryData(LATEST_RUN_KEY, run),
  });
}

export function useCancelRun() {
  const qc = useQueryClient();
  return useMutation<CollectionRun, ApiError, string>({
    mutationFn: (id) => cancelCollectionRun(id),
    // 202: прогон ещё RUNNING с поднятым флагом отмены — пишем в кэш, чтобы
    // poll продолжился и сам поймал переход RUNNING → CANCELLED.
    onSuccess: (run) => qc.setQueryData(LATEST_RUN_KEY, run),
  });
}

export function useSyncKaiten() {
  return useMutation<KaitenSyncResult, ApiError, void>({
    mutationFn: () => syncKaitenUsers(),
  });
}
