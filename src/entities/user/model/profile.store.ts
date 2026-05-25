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
import { getProfile, type ProfilePeriod } from '../api/user.api';
import type { UserProfile } from './profile';

interface ProfileStore {
  state: AsyncState<UserProfile>;
  fetch: (email: string, period: ProfilePeriod) => Promise<void>;
  reset: () => void;
}

const guard = createRaceGuard();

export const useProfileStore = create<ProfileStore>((set) => ({
  state: idleAsyncState<UserProfile>(),

  fetch: async (email, period) => {
    const requestId = guard.next();
    set((s) => ({ state: asyncLoading(s.state) }));
    try {
      const data = await getProfile(email, period);
      if (!guard.isCurrent(requestId)) return;
      set({ state: asyncSuccess(data) });
    } catch (e) {
      if (!guard.isCurrent(requestId)) return;
      const error = e instanceof ApiError ? e : toApiError(e);
      set((s) => ({ state: asyncFailure(s.state, error) }));
    }
  },

  reset: () => set({ state: idleAsyncState<UserProfile>() }),
}));
