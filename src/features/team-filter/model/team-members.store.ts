import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TEAM_MEMBERS } from '../config/team-members';

interface TeamMembersState {
  members: string[];
  add: (email: string) => boolean;
  remove: (email: string) => void;
  reset: () => void;
}

const normalize = (email: string): string => email.trim().toLowerCase();

const sortMembers = (members: readonly string[]): string[] =>
  [...members].sort((a, b) => a.localeCompare(b, 'ru'));

export const useTeamMembersStore = create<TeamMembersState>()(
  persist(
    (set, get) => ({
      members: sortMembers(DEFAULT_TEAM_MEMBERS),

      /** Возвращает true если добавили, false если такой email уже был. */
      add: (email) => {
        const normalized = normalize(email);
        if (!normalized) return false;
        const exists = get().members.some((m) => normalize(m) === normalized);
        if (exists) return false;
        set((s) => ({ members: sortMembers([...s.members, normalized]) }));
        return true;
      },

      remove: (email) => {
        const normalized = normalize(email);
        set((s) => ({
          members: s.members.filter((m) => normalize(m) !== normalized),
        }));
      },

      reset: () => set({ members: sortMembers(DEFAULT_TEAM_MEMBERS) }),
    }),
    { name: 'devpulse.team-members' },
  ),
);

export const useTeamMembers = (): readonly string[] =>
  useTeamMembersStore((s) => s.members);
