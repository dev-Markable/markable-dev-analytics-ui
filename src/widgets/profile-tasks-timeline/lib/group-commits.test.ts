import { describe, expect, it } from 'vitest';
import { groupCommitsByTask, ORPHAN_KEY } from './group-commits';
import { makeCard, makeCommit } from '@/shared/test/factories';

describe('groupCommitsByTask', () => {
  it('матчит коммит с карточкой по id из дефис-формата', () => {
    const card = makeCard({ id: 3263985 });
    const commit = makeCommit({ message: '1700-3263985 fix', taskNumber: '1700', hash: 'h1' });

    const groups = groupCommitsByTask([commit], [card]);
    const matched = groups.find((g) => g.key === '3263985');

    expect(matched).toBeDefined();
    expect(matched?.card?.id).toBe(3263985);
    expect(matched?.totalCommits).toBe(1);
  });

  it('коммиты без taskNumber → orphan-группа', () => {
    const commit = makeCommit({ message: 'no task', taskNumber: null, hash: 'h1' });
    const groups = groupCommitsByTask([commit], []);
    const orphan = groups.find((g) => g.key === ORPHAN_KEY);

    expect(orphan).toBeDefined();
    expect(orphan?.card).toBeNull();
    expect(orphan?.totalCommits).toBe(1);
  });

  it('карточка без коммитов в периоде попадает пустой группой', () => {
    const card = makeCard({ id: 999 });
    const groups = groupCommitsByTask([], [card]);
    const empty = groups.find((g) => g.key === '999');

    expect(empty).toBeDefined();
    expect(empty?.totalCommits).toBe(0);
    expect(empty?.card?.id).toBe(999);
  });

  it('агрегирует строки и считает lastCommitAt = максимум', () => {
    const card = makeCard({ id: 3263985 });
    const commits = [
      makeCommit({ message: '1-3263985 a', hash: 'h1', commitDate: '2026-05-01T10:00:00', addedLines: 10, deletedLines: 2, testAddedLines: 1 }),
      makeCommit({ message: '1-3263985 b', hash: 'h2', commitDate: '2026-05-05T10:00:00', addedLines: 20, deletedLines: 3, testAddedLines: 4 }),
    ];
    const [group] = groupCommitsByTask(commits, [card]);

    expect(group.totalCommits).toBe(2);
    expect(group.totalAddedLines).toBe(30);
    expect(group.totalDeletedLines).toBe(5);
    expect(group.totalTestAddedLines).toBe(5);
    expect(group.lastCommitAt).toBe('2026-05-05T10:00:00');
  });

  it('orphan всегда последний в сортировке', () => {
    const card = makeCard({ id: 3263985 });
    const commits = [
      makeCommit({ message: 'no task', taskNumber: null, hash: 'orphan' }),
      makeCommit({ message: '1-3263985 task', hash: 'h1', commitDate: '2026-05-05T10:00:00' }),
    ];
    const groups = groupCommitsByTask(commits, [card]);
    expect(groups[groups.length - 1]?.key).toBe(ORPHAN_KEY);
  });

  it('taskNumber без матча в cards → группа с card=null', () => {
    const commit = makeCommit({ message: '1-555 orphan-task', hash: 'h1' });
    const groups = groupCommitsByTask([commit], []);
    const g = groups.find((x) => x.key === '555');
    expect(g).toBeDefined();
    expect(g?.card).toBeNull();
    expect(g?.taskNumber).toBe('555');
  });
});
