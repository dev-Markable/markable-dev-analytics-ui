import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Спец-значения скопа фильтра. */
export const ALL_TEAMS = '__all__';
export const NO_TEAM = '__none__';

/**
 * Глобальный фильтр по команде.
 *
 * - `ALL_TEAMS` — вся компания (фильтр выключен);
 * - `NO_TEAM` — только авторы без команды;
 * - любая другая строка — имя команды из `/teams`.
 *
 * Имена команд приходят с бэка как свободный текст (без справочника),
 * поэтому стор не валидирует значение и переживает несуществующую команду —
 * фильтр просто вернёт пустой список.
 */
interface TeamScopeState {
  scope: string;
  setScope: (scope: string) => void;
  reset: () => void;
}

export const useTeamScopeStore = create<TeamScopeState>()(
  persist(
    (set) => ({
      scope: ALL_TEAMS,
      setScope: (scope) => set({ scope }),
      reset: () => set({ scope: ALL_TEAMS }),
    }),
    { name: 'devpulse.team-scope' },
  ),
);

export const useTeamScope = (): string => useTeamScopeStore((s) => s.scope);

/** Применим ли скоп к элементу с командой `team` (null = без команды). */
export function matchesScope(team: string | null | undefined, scope: string): boolean {
  if (scope === ALL_TEAMS) return true;
  if (scope === NO_TEAM) return !team;
  return team === scope;
}

/**
 * Фильтрует массив по текущему скопу команды.
 * `getTeam` — экстрактор поля `team` (string|null) из элемента.
 */
export function useTeamScopeFilter<T>(
  items: readonly T[] | null | undefined,
  getTeam: (item: T) => string | null | undefined,
): T[] {
  const scope = useTeamScope();
  return useMemo(() => {
    if (!items) return [];
    if (scope === ALL_TEAMS) return items as T[];
    return (items as T[]).filter((item) => matchesScope(getTeam(item), scope));
  }, [items, scope, getTeam]);
}
