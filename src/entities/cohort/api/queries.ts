import { queryOptions } from '@tanstack/react-query';
import {
  getCohortActivityMatrix,
  getCohortRetention,
  getTierTransitions,
  type CohortQuery,
  type RetentionQuery,
} from './cohort.api';

export const cohortRetentionQuery = (q: RetentionQuery = {}) =>
  queryOptions({
    queryKey: ['cohorts', 'retention', q] as const,
    queryFn: ({ signal }) => getCohortRetention(q, signal),
  });

export const cohortActivityMatrixQuery = (q: CohortQuery = {}) =>
  queryOptions({
    queryKey: ['cohorts', 'activity-matrix', q] as const,
    queryFn: ({ signal }) => getCohortActivityMatrix(q, signal),
  });

export const tierTransitionsQuery = (q: CohortQuery = {}) =>
  queryOptions({
    queryKey: ['cohorts', 'tier-transitions', q] as const,
    queryFn: ({ signal }) => getTierTransitions(q, signal),
  });
