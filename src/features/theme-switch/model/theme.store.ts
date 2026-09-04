import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resolveSystemTheme, type ThemeMode } from '@/shared/lib';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';

interface ThemeState {
  preference: ThemePreference;
  /** Плотность таблиц: компакт — крупным аналитикам по большим выборкам. */
  density: Density;
  setPreference: (next: ThemePreference) => void;
  setDensity: (next: Density) => void;
  cycle: () => void;
}

const order: readonly ThemePreference[] = ['light', 'dark', 'system'] as const;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      density: 'comfortable',
      setPreference: (next) => set({ preference: next }),
      setDensity: (next) => set({ density: next }),
      cycle: () =>
        set((s) => {
          const i = order.indexOf(s.preference);
          const nextI = (i + 1) % order.length;
          return { preference: order[nextI] ?? 'system' };
        }),
    }),
    // name: 'devpulse.theme' — исторический ключ; density едет в том же сторе,
    // у старых пользователей отсутствующее поле просто примет дефолт.
    { name: 'devpulse.theme' },
  ),
);

export const useThemeMode = (): ThemeMode => {
  const pref = useThemeStore((s) => s.preference);
  return pref === 'system' ? resolveSystemTheme() : pref;
};
