import { initials } from '@/shared/lib';
import type { UnifiedUser } from '../model/types';

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
