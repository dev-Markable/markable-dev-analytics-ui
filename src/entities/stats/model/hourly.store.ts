import { getHourly } from '../api/stats.api';
import { createStatsStore } from '../lib/create-stats-store';
import type { HourlyStats } from './types';

/**
 * Командный hourly (без email). Ключ кэша — from|to.
 * Для персонального hourly (по email) понадобится отдельный инстанс/ключ.
 */
export const useHourlyStore = createStatsStore<HourlyStats>(getHourly);
