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
import { getProfile, type ProfilePeriod } from '../api/user.api';
import type { UserProfile } from './profile';

interface ProfileStore {
  state: AsyncState<UserProfile>;
  fetch: (email: string, period: ProfilePeriod) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

const guard = createRaceGuard();
let currentAbort: AbortController | null = null;

export const useProfileStore = create<ProfileStore>((set) => ({
  state: idleAsyncState<UserProfile>(),

  fetch: async (email, period) => {
    currentAbort?.abort();
    const abort = new AbortController();
    currentAbort = abort;

    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getProfile(email, period, abort.signal);
      if (!guard.isCurrent(requestId)) return;
      currentAbort = null;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      if (isAbortError(e)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      set((s) => ({ state: asyncFailure(s.state, error) }));
    }
  },

  cancel: () => {
    currentAbort?.abort();
    currentAbort = null;
  },

  reset: () => {
    currentAbort?.abort();
    currentAbort = null;
    set({ state: idleAsyncState<UserProfile>() });
  },
}));
