import type { UsersComponents } from '@/shared/api/generated';

/**
 * Backend: users-api.yaml#/components/schemas/UserProfileResponse
 */
export type UserProfile = UsersComponents['schemas']['UserProfileResponse'];

export interface UserCommitsQuery {
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
