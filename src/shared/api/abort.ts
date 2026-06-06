import axios from 'axios';

/**
 * Распознаёт «запрос отменён через AbortController.abort()».
 *
 * Источники, по которым axios сигналит отмену (между версиями немного
 * меняется поведение):
 * - `axios.isCancel(error)` — главный путь;
 * - DOM `AbortError.name === 'AbortError'` или `code === 'ERR_CANCELED'`
 *   — fallback для путей, где axios не успел обернуть в Cancel.
 *
 * Использование в сторах: если catch'нутая ошибка — это отмена, **не пишем
 * в state как failure**, просто молча выходим. Это то поведение, которое
 * пользователь ждёт: «я переключил период до возврата, ошибки не хочу видеть».
 */
export function isAbortError(error: unknown): boolean {
  if (axios.isCancel(error)) return true;
  if (typeof error !== 'object' || error === null) return false;
  const e = error as { name?: string; code?: string };
  return e.name === 'AbortError' || e.name === 'CanceledError' || e.code === 'ERR_CANCELED';
}
