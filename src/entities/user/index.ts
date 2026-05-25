export type { UnifiedUser, AuthorSummary, AuthorActivity } from './model/types';
export type { UserProfile, UserCommitsQuery } from './model/profile';
export { userInitials, userDisplayName, authorAsUser } from './lib/initials';
export { UserAvatar } from './ui/UserAvatar';
export { UserChip } from './ui/UserChip';
export {
  getProfile,
  getUserCommits,
  type ProfilePeriod,
} from './api/user.api';
export { useProfileStore } from './model/profile.store';
