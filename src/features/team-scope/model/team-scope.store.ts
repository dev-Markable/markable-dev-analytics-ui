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
 * Pure-фильтр по скопу команды. Вынесен из хука, чтобы тестировать без React.
 *
 * - `getTeam` — экстрактор поля `team` из элемента.
 * - `alwaysKeep` (опц.) — элементы, для которых вернёт true, проходят
 *   фильтр независимо от скопа. Пример: на странице профиля субъект
 *   ВСЕГДА должен остаться в выборке для сравнения со средним по команде,
 *   даже если его команда не совпадает со скопом.
 */
export function filterByScope<T>(
  items: readonly T[] | null | undefined,
  scope: string,
  getTeam: (item: T) => string | null | undefined,
  alwaysKeep?: (item: T) => boolean,
): T[] {
  if (!items) return [];
  if (scope === ALL_TEAMS) return items as T[];
  return (items as T[]).filter(
    (item) =>
      matchesScope(getTeam(item), scope) || (alwaysKeep ? alwaysKeep(item) : false),
  );
}

/**
 * Хук-обёртка над `filterByScope`: подмешивает текущий скоп из стора +
 * мемоизация результата.
 */
export function useTeamScopeFilter<T>(
  items: readonly T[] | null | undefined,
  getTeam: (item: T) => string | null | undefined,
  alwaysKeep?: (item: T) => boolean,
): T[] {
  const scope = useTeamScope();
  return useMemo(
    () => filterByScope(items, scope, getTeam, alwaysKeep),
    [items, scope, getTeam, alwaysKeep],
  );
}
