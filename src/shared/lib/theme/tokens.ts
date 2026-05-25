import type { ThemeConfig } from 'antd';
import { lightTheme } from './light';
import { darkTheme } from './dark';

export type ThemeMode = 'light' | 'dark';

const themes: Record<ThemeMode, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme,
};

export const getThemeConfig = (mode: ThemeMode): ThemeConfig => themes[mode];

export const resolveSystemTheme = (): ThemeMode =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
