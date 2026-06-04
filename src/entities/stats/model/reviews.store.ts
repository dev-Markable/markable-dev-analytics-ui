import { getReviews } from '../api/stats.api';
import { createStatsStore } from '../lib/create-stats-store';
import type { ReviewStats } from './types';

export const useReviewsStore = createStatsStore<ReviewStats>(getReviews);
