/**
 * Глобальный сигнал «сессия истекла» (401). Клиент (`client.ts`) эмитит его на 401 для
 * не-auth запросов; `AuthProvider` подписывается и сбрасывает текущего пользователя →
 * гард уводит на `/login`. Развязка: `shared/api` не зависит от `entities/auth`.
 */
type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

/** Зарегистрировать обработчик 401 (null — снять). */
export function onUnauthorized(fn: UnauthorizedHandler | null): void {
  handler = fn;
}

/** Вызывается клиентом при 401. */
export function emitUnauthorized(): void {
  handler?.();
}
