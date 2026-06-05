import { describe, expect, it } from 'vitest';
import { aggregateByContributor, type AuthorEnrichment } from './aggregate-contributors';
import { makeDaily } from '@/shared/test/factories';

describe('aggregateByContributor', () => {
  it('суммирует метрики по автору, считает уникальные дни и репозитории', () => {
    const result = aggregateByContributor([
      makeDaily({ email: 'a@x5.ru', date: '2026-05-10', repo: 'core', commits: 3, mergeCommits: 1, addedLines: 100, deletedLines: 20, testAddedLines: 5 }),
      makeDaily({ email: 'a@x5.ru', date: '2026-05-10', repo: 'api', commits: 2, mergeCommits: 0, addedLines: 50, deletedLines: 10, testAddedLines: 2 }),
      makeDaily({ email: 'a@x5.ru', date: '2026-05-11', repo: 'core', commits: 4, mergeCommits: 0, addedLines: 80, deletedLines: 40, testAddedLines: 8 }),
    ]);

    expect(result).toHaveLength(1);
    const a = result[0]!;
    expect(a.email).toBe('a@x5.ru');
    expect(a.commits).toBe(9);
    expect(a.mergeCommits).toBe(1);
    expect(a.nonMergeCommits).toBe(8);
    expect(a.addedLines).toBe(230);
    expect(a.deletedLines).toBe(70);
    expect(a.testAddedLines).toBe(15);
    expect(a.activeDays).toBe(2); // 2026-05-10, 2026-05-11
    expect(a.repos).toBe(2); // core, api
  });

  it('сортирует по убыванию nonMergeCommits', () => {
    const result = aggregateByContributor([
      makeDaily({ email: 'low@x5.ru', commits: 2 }),
      makeDaily({ email: 'high@x5.ru', commits: 20 }),
      makeDaily({ email: 'mid@x5.ru', commits: 7 }),
    ]);
    expect(result.map((r) => r.email)).toEqual(['high@x5.ru', 'mid@x5.ru', 'low@x5.ru']);
  });

  it('день без коммитов (merge-only) не считается активным', () => {
    const [result] = aggregateByContributor([
      makeDaily({ email: 'a@x5.ru', date: '2026-05-10', commits: 0, mergeCommits: 0 }),
      makeDaily({ email: 'a@x5.ru', date: '2026-05-11', commits: 3 }),
    ]);
    // Активный — только 11-е число.
    expect(result?.activeDays).toBe(1);
  });

  it('enrichment подмешивает displayName/avatarUrl/team/isLead', () => {
    const enrichment = new Map<string, AuthorEnrichment>([
      [
        'a@x5.ru',
        { displayName: 'Alice', avatarUrl: 'https://x/a.png', team: 'Маркировка', isLead: true },
      ],
    ]);
    const [result] = aggregateByContributor([makeDaily({ email: 'a@x5.ru' })], enrichment);
    expect(result?.displayName).toBe('Alice');
    expect(result?.avatarUrl).toBe('https://x/a.png');
    expect(result?.team).toBe('Маркировка');
    expect(result?.isLead).toBe(true);
  });

  it('без enrichment поля null/false', () => {
    const [result] = aggregateByContributor([makeDaily({ email: 'a@x5.ru' })]);
    expect(result?.displayName).toBeNull();
    expect(result?.avatarUrl).toBeNull();
    expect(result?.team).toBeNull();
    expect(result?.isLead).toBe(false);
  });

  it('enrichment ищется регистронезависимо по email (ключ — lowercase)', () => {
    const enrichment = new Map<string, AuthorEnrichment>([
      ['boris@x5.ru', { displayName: 'Boris', avatarUrl: null, team: 'Платформа', isLead: false }],
    ]);
    // В daily email в смешанном регистре — должен сматчиться.
    const [result] = aggregateByContributor([makeDaily({ email: 'Boris@X5.ru' })], enrichment);
    expect(result?.displayName).toBe('Boris');
    expect(result?.team).toBe('Платформа');
  });

  it('пустой массив daily → пустой результат', () => {
    expect(aggregateByContributor([])).toEqual([]);
  });
});
