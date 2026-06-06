import { create } from 'zustand';
import {
  ApiError,
  asyncFailure,
  asyncLoading,
  asyncSuccess,
  createRaceGuard,
  idleAsyncState,
  isAbortError,
  isFresh,
  toApiError,
  type AsyncState,
} from '@/shared/api';
import { STORE_CACHE_TTL_MS } from '@/shared/config';
import { getTeams, setTeamLead } from '../api/team.api';
import type { Team } from './types';

interface TeamsStore {
  state: AsyncState<Team[]>;
  /** Загрузить список команд. Кэш TTL — см. STORE_CACHE_TTL_MS. */
  fetch: (force?: boolean) => Promise<void>;
  /** Назначить лида и обновить локальный кэш. */
  assignLead: (team: string, email: string | null) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

const guard = createRaceGuard();
let currentAbort: AbortController | null = null;

export const useTeamsStore = create<TeamsStore>((set, get) => ({
  state: idleAsyncState<Team[]>(),

  fetch: async (force = false) => {
    const current = get().state;
    if (!force && current.status === 'success' && isFresh(current, STORE_CACHE_TTL_MS)) return;

    currentAbort?.abort();
    const abort = new AbortController();
    currentAbort = abort;

    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getTeams(abort.signal);
      if (!guard.isCurrent(requestId)) return;
      currentAbort = null;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      if (isAbortError(e)) return;
      set((s) => ({ state: asyncFailure(s.state, e instanceof ApiError ? e : toApiError(e)) }));
    }
  },

  assignLead: async (team, email) => {
    const updated = await setTeamLead(team, email);
    // Бэк возвращает свежее состояние команды — подменяем точечно.
    const current = get().state;
    if (current.data) {
      set({
        state: asyncSuccess(
          current.data.map((t) => (t.name === updated.name ? updated : t)),
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
    set({ state: idleAsyncState<Team[]>() });
  },
}));
