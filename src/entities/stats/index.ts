export type {
  DailyStat,
  WeeklyStat,
  PeriodSummary,
  HourlyStats,
  HourlyCell,
  ReviewStats,
  ReviewAuthor,
  DefectsByPeriodRequest,
  DefectsByPeriodResponse,
  PeriodRange,
  PeriodDefects,
  PriorityCounts,
  DefectItem,
  DefectMember,
  MarkDefectsAiAgentResponse,
  MergedMrStats,
  MergedMrByAuthor,
  MergedMrByRepo,
} from './model/types';
export {
  getSummary,
  getWeekly,
  getDaily,
  getHourly,
  getReviews,
  getTeamDefects,
  getMergedMrs,
  markDefectsAiAgent,
  type PeriodQuery,
  type HourlyQuery,
  type MergedMrQuery,
} from './api/stats.api';
export {
  summaryQuery,
  weeklyQuery,
  dailyQuery,
  hourlyQuery,
  reviewsQuery,
  mergedMrsQuery,
} from './api/queries';
export { weekEnd, weekShortLabel, weekFullLabel } from './lib/week-label';
export { applyTeamFilterToWeekly } from './lib/apply-team-filter';
