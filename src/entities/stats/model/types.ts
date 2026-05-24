import type { AuthorActivity } from '@/entities/user/model/types';

export interface DailyStat {
  id: number;
  email: string;
  date: string;
  repo: string;
  commits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
  lastUpdated: string;
  userId: number | null;
}

export interface WeeklyStat {
  year: number;
  week: number;
  weekStart: string;
  totalCommits: number;
  totalMergeCommits: number;
  totalAddedLines: number;
  totalDeletedLines: number;
  totalTestAddedLines: number;
  authors: AuthorActivity[];
}

export interface PeriodSummary {
  from: string;
  to: string;
  totalCommits: number;
  totalMergeCommits: number;
  totalAddedLines: number;
  totalDeletedLines: number;
  totalTestAddedLines: number;
  uniqueAuthors: number;
  topAuthors: AuthorActivity[];
}
