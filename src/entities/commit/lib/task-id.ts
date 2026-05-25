import type { Commit } from '../model/types';

/**
 * Шаблон «<space>-<task>» — например, `1700-3263985`. Встречается
 * и в обычных коммитах (`1700-3263985 fix bug`), и в merge-коммитах
 * (`Merge branch 'feature/1700-3263985_uc5' into ...`).
 *
 * Берём ВТОРУЮ группу (то, что после дефиса) — это и есть ID
 * карточки Kaiten. Backend парсит только первое число (номер пространства),
 * поэтому `commit.taskNumber` от бэка для матчинга бесполезен.
 */
const SPACE_TASK_PATTERN = /(\d+)-(\d+)/;

/**
 * Извлекает ID карточки Kaiten из коммита.
 * Если сообщение содержит «space-task» — берём `task`.
 * Иначе — фоллбэк на `commit.taskNumber` (что-то лучше чем ничего).
 */
export function extractCardId(commit: Pick<Commit, 'message' | 'taskNumber'>): string | null {
  const m = commit.message.match(SPACE_TASK_PATTERN);
  if (m && m[2]) return m[2];
  return commit.taskNumber;
}

/**
 * Убирает префикс задачи из сообщения коммита для красивого отображения.
 * Покрывает оба формата: «1700-3263985 текст» и «12345 текст».
 */
export function stripTaskPrefix(message: string): string {
  return message
    .trim()
    .replace(/^\d+-\d+[\s:.,-]*/, '')
    .replace(/^\d+[\s:.,-]+/, '');
}
