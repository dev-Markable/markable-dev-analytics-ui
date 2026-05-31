import { getWeekly } from '../api/stats.api';
import { createStatsStore } from '../lib/create-stats-store';
import type { WeeklyStat } from './types';

export const useWeeklyStore = createStatsStore<WeeklyStat[]>(getWeekly);
