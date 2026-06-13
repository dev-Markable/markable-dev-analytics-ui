import { describe, expect, it } from 'vitest';
import { makeDaily } from '@/shared/test/factories';
import type { DrillEnrichment } from '../model/types';
import { aggregateDailyDrill } from './aggregate-daily';

const enrich = new Map<string, DrillEnrichment>([
  ['a@x5.ru', { displayName: 'Alice', avatarUrl: null, team: 'Core', isLead: true }],
]);

describe('aggregateDailyDrill', () => {
  it('суммирует по автору и считает не-мердж коммиты', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', commits: 10, mergeCommits: 2, addedLines: 100, deletedLines: 30 }),
      makeDaily({ email: 'a@x5.ru', commits: 5, mergeCommits: 1, addedLines: 50, deletedLines: 10 }),
    ];
    const rows = aggregateDailyDrill(daily, enrich);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.email).toBe('a@x5.ru');
    expect(rows[0]!.stats[0]).toEqual({ label: 'Коммиты', value: '12' }); // (10-2)+(5-1)
  });

  it('подмешивает enrichment по email (lowercase)', () => {
    const rows = aggregateDailyDrill([makeDaily({ email: 'A@x5.ru', commits: 3 })], enrich);
    expect(rows[0]).toMatchObject({ displayName: 'Alice', team: 'Core', isLead: true });
  });

  it('без enrichment — null-поля, isLead=false', () => {
    const rows = aggregateDailyDrill([makeDaily({ email: 'ghost@x5.ru', commits: 1 })], new Map());
    expect(rows[0]).toMatchObject({ displayName: null, team: null, isLead: false });
  });

  it('сортирует по не-мердж коммитам убыванием', () => {
    const daily = [
      makeDaily({ email: 'low@x5.ru', commits: 2 }),
      makeDaily({ email: 'high@x5.ru', commits: 20 }),
    ];
    expect(aggregateDailyDrill(daily, new Map()).map((r) => r.email)).toEqual([
      'high@x5.ru',
      'low@x5.ru',
    ]);
  });
});
