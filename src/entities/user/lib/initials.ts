import { initials } from '@/shared/lib';
import type { AuthorActivity, UnifiedUser } from '../model/types';

type UserLike = Pick<UnifiedUser, 'name' | 'username' | 'email' | 'avatarUrl'>;

export const userInitials = (u: Pick<UnifiedUser, 'name' | 'username' | 'email'>): string => {
  const candidate = u.name ?? u.username ?? u.email;
  if (!candidate) return '?';
  if (candidate.includes('@')) {
    const local = candidate.split('@')[0] ?? candidate;
    return initials(local.replace(/[._-]+/g, ' ')) || local.slice(0, 2).toUpperCase();
  }
  return initials(candidate) || candidate.slice(0, 2).toUpperCase();
};

export const userDisplayName = (
  u: Pick<UnifiedUser, 'name' | 'username' | 'email'>,
): string => u.name ?? u.username ?? u.email;

/**
 * Преобразует enriched-агрегацию автора (с бэка) в shape, понятный UserAvatar/UserChip.
 * `displayName`/`avatarUrl` могут быть `null` — компоненты сами упадут на инициалы и градиент.
 */
export const authorAsUser = (a: AuthorActivity): UserLike => ({
  email: a.email,
  name: a.displayName,
  username: null,
  avatarUrl: a.avatarUrl,
});
