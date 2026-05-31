import type { Schemas } from '@/shared/api/schema';

/**
 * Backend: users-api.yaml#/components/schemas/UserProfileResponse
 */
export type UserProfile = Schemas['UserProfileResponse'];

export interface UserCommitsQuery {
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
