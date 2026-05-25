import { create } from 'zustand';
import {
  ApiError,
  asyncFailure,
  asyncLoading,
  asyncSuccess,
  createRaceGuard,
  idleAsyncState,
  toApiError,
  type AsyncState,
} from '@/shared/api';
import {
  getCollectionRun,
  syncKaitenUsers,
  triggerCollection,
} from '../api/collection.api';
import type { CollectionRun, KaitenSyncResult } from './types';

interface CollectionStore {
  /** Последний прогон, который пользователь видел в этой сессии. */
  lastRun: AsyncState<CollectionRun>;
  /** Результат последней синхронизации Kaiten-пользователей. */
  kaitenSync: AsyncState<KaitenSyncResult>;

  trigger: (since?: string) => Promise<void>;
  refresh: (id: string) => Promise<void>;
  syncKaiten: () => Promise<void>;
  reset: () => void;
}

const runGuard = createRaceGuard();
const syncGuard = createRaceGuard();

export const useCollectionStore = create<CollectionStore>((set) => ({
  lastRun: idleAsyncState<CollectionRun>(),
  kaitenSync: idleAsyncState<KaitenSyncResult>(),

  trigger: async (since) => {
    const requestId = runGuard.next();
    set((s) => ({ lastRun: asyncLoading(s.lastRun) }));
    try {
      const data = await triggerCollection(since ? { since } : {});
      if (!runGuard.isCurrent(requestId)) return;
      set({ lastRun: asyncSuccess(data) });
    } catch (e) {
      if (!runGuard.isCurrent(requestId)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      set((s) => ({ lastRun: asyncFailure(s.lastRun, error) }));
    }
  },

  refresh: async (id) => {
    const requestId = runGuard.next();
    set((s) => ({ lastRun: asyncLoading(s.lastRun) }));
    try {
      const data = await getCollectionRun(id);
      if (!runGuard.isCurrent(requestId)) return;
      set({ lastRun: asyncSuccess(data) });
    } catch (e) {
      if (!runGuard.isCurrent(requestId)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      set((s) => ({ lastRun: asyncFailure(s.lastRun, error) }));
    }
  },

  syncKaiten: async () => {
    const requestId = syncGuard.next();
    set((s) => ({ kaitenSync: asyncLoading(s.kaitenSync) }));
    try {
      const data = await syncKaitenUsers();
      if (!syncGuard.isCurrent(requestId)) return;
      set({ kaitenSync: asyncSuccess(data) });
    } catch (e) {
      if (!syncGuard.isCurrent(requestId)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      set((s) => ({ kaitenSync: asyncFailure(s.kaitenSync, error) }));
    }
  },

  reset: () =>
    set({
      lastRun: idleAsyncState<CollectionRun>(),
      kaitenSync: idleAsyncState<KaitenSyncResult>(),
    }),
}));
