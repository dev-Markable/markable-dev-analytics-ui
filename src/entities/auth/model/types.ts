import type { Schemas } from '@/shared/api/schema';

/**
 * Типы аутентификации — из контракта (`@devpulse-dev/api-types`, auth-api 3.3.0), а не
 * локальные: бэк теперь реализует сгенерированный AuthApi, контракт — источник истины.
 */

/** Роль для RBAC (ADR-13). Backend: auth-api#/components/schemas/Role. */
export type Role = Schemas['Role'];

/** Текущий пользователь (`/auth/login`, `/auth/me`). Backend: AuthMeResponse. */
export type CurrentUser = Schemas['AuthMeResponse'];

/** Публичная конфигурация auth (`/auth/config`). Backend: AuthConfigResponse. */
export type AuthConfig = Schemas['AuthConfigResponse'];

/** ADMIN и TEAMLEAD — полный доступ; MEMBER — ограниченный (см. матрицу в ADR-13). */
export function isElevated(role: Role): boolean {
  return role === 'ADMIN' || role === 'TEAMLEAD';
}
