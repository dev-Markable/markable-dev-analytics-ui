export type {
  UnifiedUser,
  AuthorSummary,
  AuthorActivity,
  ActivityScore,
  ActivityCategory,
} from './model/types';
export type { UserProfile, UserCommitsQuery } from './model/profile';
export { userInitials, userDisplayName, authorAsUser } from './lib/initials';
export { UserAvatar } from './ui/UserAvatar';
export { UserChip } from './ui/UserChip';
export { ActivityBadge } from './ui/ActivityBadge';
export {
  getProfile,
  getUserCommits,
  getUsers,
  setUserTeam,
  type ProfilePeriod,
} from './api/user.api';
export { useProfileStore } from './model/profile.store';
export { useUsersStore } from './model/users.store';
