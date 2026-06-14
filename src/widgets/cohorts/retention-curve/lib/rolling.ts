import type { CohortRetention } from '@/entities/cohort';

export interface RollingPoint {
  /** Смещение k месяцев от старта когорты. */
  offset: number;
  /** Усреднённая по когортам доля активных [0..1]. */
  retention: number;
  /** Сколько когорт участвовало в усреднении на этом смещении. */
  cohorts: number;
}

/**
 * Rolling retention curve: на каждом смещении k — доля активных, усреднённая по
 * всем когортам и взвешенная по их размеру (большая когорта весит больше).
 * Даёт одну линию «насколько липкая инженерка в целом».
 */
export function computeRollingRetention(data: CohortRetention | null | undefined): RollingPoint[] {
  const cohorts = data?.cohorts ?? [];
  if (cohorts.length === 0) return [];

  const maxLen = cohorts.reduce((m, c) => Math.max(m, c.retention.length), 0);
  const points: RollingPoint[] = [];

  for (let k = 0; k < maxLen; k++) {
    let weighted = 0;
    let weight = 0;
    let n = 0;
    for (const c of cohorts) {
      const v = c.retention[k];
      if (v == null) continue;
      weighted += v * c.size;
      weight += c.size;
      n += 1;
    }
    if (weight === 0) continue;
    points.push({ offset: k, retention: weighted / weight, cohorts: n });
  }

  return points;
}
