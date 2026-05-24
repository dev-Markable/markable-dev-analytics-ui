import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isTeamMember } from '../config/team-members';

interface TeamFilterState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (next: boolean) => void;
}

export const useTeamFilterStore = create<TeamFilterState>()(
  persist(
    (set) => ({
      enabled: false,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setEnabled: (next) => set({ enabled: next }),
    }),
    { name: 'devpulse.team-filter' },
  ),
);

export function useTeamFilter<T>(
  items: readonly T[] | null | undefined,
  getEmail: (item: T) => string,
): T[] {
  const enabled = useTeamFilterStore((s) => s.enabled);
  if (!items) return [];
  if (!enabled) return items as T[];
  return (items as T[]).filter((item) => isTeamMember(getEmail(item)));
}
