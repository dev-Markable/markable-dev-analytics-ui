import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTeamMembersStore } from './team-members.store';

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

/**
 * Фильтрует массив по членству в команде. Читает актуальный список
 * из useTeamMembersStore, поэтому при добавлении/удалении email в
 * настройках фильтрация обновляется автоматически.
 */
export function useTeamFilter<T>(
  items: readonly T[] | null | undefined,
  getEmail: (item: T) => string,
): T[] {
  const enabled = useTeamFilterStore((s) => s.enabled);
  const members = useTeamMembersStore((s) => s.members);

  const memberSet = useMemo(
    () => new Set(members.map((m) => m.toLowerCase())),
    [members],
  );

  if (!items) return [];
  if (!enabled) return items as T[];
  return (items as T[]).filter((item) => memberSet.has(getEmail(item).toLowerCase()));
}
