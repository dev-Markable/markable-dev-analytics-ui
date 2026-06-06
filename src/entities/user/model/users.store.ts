import { create } from 'zustand';
import {
  ApiError,
  asyncFailure,
  asyncLoading,
  asyncSuccess,
  createRaceGuard,
  idleAsyncState,
  isAbortError,
  toApiError,
  type AsyncState,
} from '@/shared/api';
import { getUsers, setUserTeam } from '../api/user.api';
import type { UnifiedUser } from './types';

interface UsersStore {
  state: AsyncState<UnifiedUser[]>;
  fetch: () => Promise<void>;
  /** Назначить команду и обновить запись в кэше списка локально. */
  assignTeam: (email: string, team: string | null) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

const guard = createRaceGuard();
let currentAbort: AbortController | null = null;

export const useUsersStore = create<UsersStore>((set, get) => ({
  state: idleAsyncState<UnifiedUser[]>(),

  fetch: async () => {
    currentAbort?.abort();
    const abort = new AbortController();
    currentAbort = abort;

    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getUsers(undefined, abort.signal);
      if (!guard.isCurrent(requestId)) return;
      currentAbort = null;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      if (isAbortError(e)) return;
      set((s) => ({ state: asyncFailure(s.state, e instanceof ApiError ? e : toApiError(e)) }));
    }
  },

  assignTeam: async (email, team) => {
    const updated = await setUserTeam(email, team);
    // Оптимистично-точечное обновление: подменяем запись в загруженном списке.
    const current = get().state;
    if (current.data) {
      set({
        state: asyncSuccess(
          current.data.map((u) => (u.email === updated.email ? updated : u)),
        ),
      });
    }
  },

  cancel: () => {
    currentAbort?.abort();
    currentAbort = null;
  },

  reset: () => {
    currentAbort?.abort();
    currentAbort = null;
    set({ state: idleAsyncState<UnifiedUser[]>() });
  },
}));
