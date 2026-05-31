import type { AuthorActivity, ActivityScore, ActivityCategory } from '@/entities/user';
import type { Commit } from '@/entities/commit';
import type { KaitenCard } from '@/entities/kaiten-card';
import type { DailyStat, WeeklyStat } from '@/entities/stats';

/**
 * Фабрики тестовых данных. Только для *.test.ts — в прод-бандл не попадают
 * (не импортятся из прод-кода, tree-shaken).
 */

export function makeActivity(over: Partial<ActivityScore> = {}): ActivityScore {
  return {
    score: 1,
    category: 'ACTIVE',
    volumeFactor: 1,
    qualityFactor: 1,
    avgLinesPerCommit: 50,
    ...over,
  };
}

export function makeAuthor(over: Partial<AuthorActivity> = {}): AuthorActivity {
  const commits = over.commits ?? 10;
  const mergeCommits = over.mergeCommits ?? 0;
  return {
    email: 'dev@x5.ru',
    displayName: null,
    avatarUrl: null,
    commits,
    mergeCommits,
    nonMergeCommits: commits - mergeCommits,
    addedLines: 100,
    deletedLines: 20,
    testAddedLines: 10,
    activity: null,
    ...over,
  };
}

/** Автор с конкретной категорией активности — частый кейс для секций дашборда. */
export function makeAuthorWithCategory(
  email: string,
  category: ActivityCategory,
  score: number,
): AuthorActivity {
  return makeAuthor({ email, activity: makeActivity({ category, score }) });
}

export function makeCommit(over: Partial<Commit> = {}): Commit {
  return {
    hash: 'a1b2c3d4',
    authorEmail: 'dev@x5.ru',
    commitDate: '2026-05-10T12:00:00',
    merge: false,
    addedLines: 42,
    deletedLines: 7,
    testAddedLines: 12,
    message: 'fix the bug',
    taskNumber: null,
    repo: 'xrg-core',
    ...over,
  };
}

export function makeCard(over: Partial<KaitenCard> = {}): KaitenCard {
  return {
    id: 3263985,
    title: 'Fix the bug',
    description: null,
    typeId: 70,
    cardType: 'DEVELOPMENT',
    columnType: 2,
    columnStatus: 'IN_PROGRESS',
    columnTitle: 'В работе',
    boardName: 'Core',
    spaceName: 'Engineering',
    ownerId: 7,
    ownerName: 'Boris',
    createdAt: '2026-05-01T10:00:00',
    updatedAt: '2026-05-10T12:00:00',
    closedAt: null,
    archived: false,
    closed: false,
    url: 'https://kaiten.x5.ru/3263985',
    memberIds: [7],
    ...over,
  };
}

export function makeWeek(over: Partial<WeeklyStat> = {}): WeeklyStat {
  return {
    year: 2026,
    week: 19,
    weekStart: '2026-05-04',
    totalCommits: 0,
    totalMergeCommits: 0,
    totalAddedLines: 0,
    totalDeletedLines: 0,
    totalTestAddedLines: 0,
    authors: [],
    ...over,
  };
}

export function makeDaily(over: Partial<DailyStat> = {}): DailyStat {
  return {
    id: 1,
    email: 'dev@x5.ru',
    date: '2026-05-10',
    repo: 'xrg-core',
    commits: 3,
    mergeCommits: 0,
    addedLines: 124,
    deletedLines: 58,
    testAddedLines: 22,
    lastUpdated: '2026-05-10T01:02:15',
    userId: 42,
    ...over,
  };
}
