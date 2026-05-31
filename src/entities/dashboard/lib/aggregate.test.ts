import { describe, expect, it } from 'vitest';
import { aggregateAuthors, EMPTY_TOTALS } from './aggregate';
import { makeAuthor } from '@/shared/test/factories';

describe('aggregateAuthors', () => {
  it('пустой список → EMPTY_TOTALS', () => {
    expect(aggregateAuthors([])).toEqual(EMPTY_TOTALS);
  });

  it('суммирует все поля и считает uniqueAuthors', () => {
    const authors = [
      makeAuthor({ email: 'a@x5.ru', commits: 10, mergeCommits: 2, addedLines: 100, deletedLines: 30, testAddedLines: 15 }),
      makeAuthor({ email: 'b@x5.ru', commits: 5, mergeCommits: 1, addedLines: 50, deletedLines: 10, testAddedLines: 5 }),
    ];
    const totals = aggregateAuthors(authors);

    expect(totals.totalCommits).toBe(15);
    expect(totals.totalMergeCommits).toBe(3);
    expect(totals.totalNonMergeCommits).toBe(12); // (10-2) + (5-1)
    expect(totals.totalAddedLines).toBe(150);
    expect(totals.totalDeletedLines).toBe(40);
    expect(totals.totalTestAddedLines).toBe(20);
    expect(totals.uniqueAuthors).toBe(2);
  });
});
