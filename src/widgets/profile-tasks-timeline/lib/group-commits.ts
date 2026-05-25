import { extractCardId, type Commit } from '@/entities/commit';
import type { KaitenCard } from '@/entities/kaiten-card';

export const ORPHAN_KEY = '__no_task';

export interface TaskGroup {
  /** Уникальный ключ для AntD Table. ORPHAN_KEY = коммиты без `taskNumber`. */
  key: string;
  /** Карточка Kaiten или null (нет связки / orphan). */
  card: KaitenCard | null;
  /** Номер задачи из коммита (или null для orphan). */
  taskNumber: string | null;
  commits: Commit[];
  totalCommits: number;
  totalAddedLines: number;
  totalDeletedLines: number;
  totalTestAddedLines: number;
  /** Дата последнего коммита, ISO. Используется для сортировки. */
  lastCommitAt: string | null;
}

/**
 * Группирует коммиты по `taskNumber` и сшивает с карточками Kaiten.
 *
 * - `taskNumber` совпадает с `card.id` (строка vs число — приводим)
 * - Коммиты без `taskNumber` идут в orphan-группу
 * - Карточки без коммитов в периоде тоже попадают в результат — пустыми группами
 * - Sort: по `lastCommitAt` desc, orphan последний
 */
export function groupCommitsByTask(
  commits: readonly Commit[],
  cards: readonly KaitenCard[],
): TaskGroup[] {
  const cardById = new Map<string, KaitenCard>(cards.map((c) => [String(c.id), c]));
  const groups = new Map<string, TaskGroup>();

  const ensureGroup = (
    key: string,
    taskNumber: string | null,
    card: KaitenCard | null,
  ): TaskGroup => {
    const existing = groups.get(key);
    if (existing) return existing;
    const fresh: TaskGroup = {
      key,
      card,
      taskNumber,
      commits: [],
      totalCommits: 0,
      totalAddedLines: 0,
      totalDeletedLines: 0,
      totalTestAddedLines: 0,
      lastCommitAt: null,
    };
    groups.set(key, fresh);
    return fresh;
  };

  for (const c of commits) {
    // Реальный ID карточки = часть после дефиса в шаблоне «<space>-<task>».
    // Бэк парсит только номер пространства (первое число до дефиса),
    // поэтому для матчинга используем собственный парсер.
    const cardId = extractCardId(c);
    if (cardId == null) {
      const g = ensureGroup(ORPHAN_KEY, null, null);
      pushCommit(g, c);
      continue;
    }
    const card = cardById.get(cardId) ?? null;
    const g = ensureGroup(cardId, cardId, card);
    pushCommit(g, c);
  }

  // Карточки без коммитов в периоде — тоже показываем
  for (const card of cards) {
    const key = String(card.id);
    if (!groups.has(key)) {
      ensureGroup(key, key, card);
    }
  }

  return Array.from(groups.values()).sort(compareTaskGroups);
}

function pushCommit(group: TaskGroup, c: Commit): void {
  group.commits.push(c);
  group.totalCommits += 1;
  group.totalAddedLines += c.addedLines;
  group.totalDeletedLines += c.deletedLines;
  group.totalTestAddedLines += c.testAddedLines;
  if (!group.lastCommitAt || c.commitDate > group.lastCommitAt) {
    group.lastCommitAt = c.commitDate;
  }
}

function compareTaskGroups(a: TaskGroup, b: TaskGroup): number {
  if (a.key === ORPHAN_KEY) return 1;
  if (b.key === ORPHAN_KEY) return -1;
  if (a.lastCommitAt && b.lastCommitAt) {
    return b.lastCommitAt.localeCompare(a.lastCommitAt);
  }
  if (a.lastCommitAt) return -1;
  if (b.lastCommitAt) return 1;
  return (b.card?.updatedAt ?? '').localeCompare(a.card?.updatedAt ?? '');
}
