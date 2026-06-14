import { describe, expect, it } from 'vitest';
import type { CohortRetention } from '@/entities/cohort';
import { computeRollingRetention } from './rolling';

const data = (cohorts: CohortRetention['cohorts']): CohortRetention => ({
  interval: 'month',
  cohorts,
});

describe('computeRollingRetention', () => {
  it('пусто → []', () => {
    expect(computeRollingRetention(null)).toEqual([]);
    expect(computeRollingRetention(data([]))).toEqual([]);
  });

  it('взвешивает по размеру когорты', () => {
    // k=1: когорта A(size100)=0.5, B(size10)=1.0 → (0.5*100 + 1*10)/110 ≈ 0.545
    const res = computeRollingRetention(
      data([
        { cohort: '2026-01', size: 100, retention: [1, 0.5] },
        { cohort: '2026-02', size: 10, retention: [1, 1] },
      ]),
    );
    expect(res[0]).toEqual({ offset: 0, retention: 1, cohorts: 2 });
    expect(res[1]!.retention).toBeCloseTo(60 / 110, 5);
    expect(res[1]!.cohorts).toBe(2);
  });

  it('длина = максимальной retention среди когорт; пропуски не ломают', () => {
    const res = computeRollingRetention(
      data([
        { cohort: '2026-01', size: 5, retention: [1, 0.4, 0.2] },
        { cohort: '2026-03', size: 5, retention: [1] }, // молодая когорта
      ]),
    );
    expect(res).toHaveLength(3);
    // на k=2 участвует только первая когорта
    expect(res[2]).toEqual({ offset: 2, retention: 0.2, cohorts: 1 });
  });
});
