import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resolveSystemTheme, type ThemeMode } from '@/shared/lib';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  cycle: () => void;
}

const order: readonly ThemePreference[] = ['light', 'dark', 'system'] as const;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (next) => set({ preference: next }),
      cycle: () =>
        set((s) => {
          const i = order.indexOf(s.preference);
          const nextI = (i + 1) % order.length;
          return { preference: order[nextI] ?? 'system' };
        }),
    }),
    { name: 'markable.theme' },
  ),
);

export const useThemeMode = (): ThemeMode => {
  const pref = useThemeStore((s) => s.preference);
  return pref === 'system' ? resolveSystemTheme() : pref;
};
