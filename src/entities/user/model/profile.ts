import type { AuthorSummary, UnifiedUser } from './types';
import type { Commit } from '@/entities/commit/model/types';
import type { KaitenCard } from '@/entities/kaiten-card/model/types';

export interface UserProfile {
  user: UnifiedUser;
  summary: AuthorSummary;
  commits: Commit[];
  cards: KaitenCard[];
}

export interface UserCommitsQuery {
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
