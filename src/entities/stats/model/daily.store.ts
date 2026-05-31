import { getDaily } from '../api/stats.api';
import { createStatsStore } from '../lib/create-stats-store';
import type { DailyStat } from './types';

export const useDailyStore = createStatsStore<DailyStat[]>(getDaily);
