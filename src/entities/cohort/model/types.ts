import type { Schemas } from '@/shared/api/schema';

/**
 * Когортный retention-треугольник. Backend: stats-contract Cohorts тег.
 * `interval` зафиксирован в 'month' (см. COHORT-RETENTION.md §4).
 */
export type CohortRetention = Schemas['CohortRetention'];
export type CohortRow = CohortRetention['cohorts'][number];

/** Матрица «разработчик × месяц» (не-мердж коммиты). */
export type CohortActivityMatrix = Schemas['CohortActivityMatrix'];
export type CohortDeveloper = CohortActivityMatrix['developers'][number];

/** 4×4 матрица переходов тиров активности месяц-к-месяцу. */
export type TierTransitions = Schemas['TierTransitions'];
export type ActivityTier = TierTransitions['tiers'][number];
