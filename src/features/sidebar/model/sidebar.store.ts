import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Состояние сайдбара: свёрнут ли он до иконок.
 * Сохраняется в localStorage — пользователь привык к своему положению.
 */
interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (next: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (next) => set({ collapsed: next }),
    }),
    { name: 'devpulse.sidebar' },
  ),
);
