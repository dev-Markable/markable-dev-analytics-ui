export interface RaceGuard {
  next: () => number;
  isCurrent: (id: number) => boolean;
}

/**
 * Простой счётчик для защиты от гонки в Zustand-сторе.
 *
 * ```
 * const guard = createRaceGuard();
 * const myId = guard.next();
 * const data = await api();
 * if (!guard.isCurrent(myId)) return; // юзер успел переключить фильтр
 * set({ data });
 * ```
 */
export const createRaceGuard = (): RaceGuard => {
  let counter = 0;
  return {
    next: () => ++counter,
    isCurrent: (id) => id === counter,
  };
};
