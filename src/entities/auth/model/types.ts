/**
 * Роль текущего пользователя (RBAC, ADR-13). Источник — `GET /auth/me`.
 * Определена на фронте локально: auth-эндпоинты на бэке рукописные (adapter-auth),
 * не генерируются из OAS — формализация контракта auth в OAS будет отдельно.
 */
export type Role = 'MEMBER' | 'TEAMLEAD' | 'ADMIN';

/** Текущий аутентифицированный пользователь (`GET /auth/me`, `POST /auth/login`). */
export interface CurrentUser {
  email: string;
  role: Role;
  name: string | null;
  avatarUrl: string | null;
  team: string | null;
}

/** ADMIN и TEAMLEAD — полный доступ; MEMBER — ограниченный (см. матрицу в ADR-13). */
export function isElevated(role: Role): boolean {
  return role === 'ADMIN' || role === 'TEAMLEAD';
}
