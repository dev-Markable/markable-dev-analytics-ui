import { getSummary } from '../api/stats.api';
import { createStatsStore } from '../lib/create-stats-store';
import type { PeriodSummary } from './types';

export const useSummaryStore = createStatsStore<PeriodSummary>(getSummary);
