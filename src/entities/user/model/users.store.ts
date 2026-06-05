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
import { getUsers, setUserTeam } from '../api/user.api';
import type { UnifiedUser } from './types';

interface UsersStore {
  state: AsyncState<UnifiedUser[]>;
  fetch: () => Promise<void>;
  /** Назначить команду и обновить запись в кэше списка локально. */
  assignTeam: (email: string, team: string | null) => Promise<void>;
  reset: () => void;
}

const guard = createRaceGuard();

export const useUsersStore = create<UsersStore>((set, get) => ({
  state: idleAsyncState<UnifiedUser[]>(),

  fetch: async () => {
    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getUsers();
      if (!guard.isCurrent(requestId)) return;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
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

  reset: () => set({ state: idleAsyncState<UnifiedUser[]>() }),
}));
