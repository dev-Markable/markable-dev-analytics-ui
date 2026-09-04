import { describe, expect, it } from 'vitest';
import { formatNumber } from '@/shared/lib';
import { buildHourlyDrill } from './hourly-drill';

const base = {
  weekday: 2,
  weekdayLabel: 'Ср',
  hour: 17,
  commits: 8,
  addedLines: 1240,
  totalCommits: 170,
  weekdayCommits: 40,
  hourCommits: 20,
  rank: 1,
  activeCells: 34,
};

describe('buildHourlyDrill', () => {
  it('заголовок — день и час с ведущим нулём', () => {
    expect(buildHourlyDrill({ ...base, hour: 9 }).title).toBe('Ср, 09:00');
  });

  it('подпись содержит коммиты и место среди активных часов', () => {
    expect(buildHourlyDrill(base).subtitle).toContain('1-е место из 34');
  });

  it('разбивки по людям нет — контракт HourlyCell не содержит email', () => {
    expect(buildHourlyDrill(base).rows).toEqual([]);
  });

  it('считает доли от периода, дня и часа', () => {
    const values = buildHourlyDrill(base).highlights?.map((h) => h.value);

    expect(values?.[0]).toBe('4.7%'); // 8 из 170
    expect(values?.[1]).toBe('20%'); // 8 из 40 за среду
    expect(values?.[2]).toBe('40%'); // 8 из 20 в 17:00 за неделю
  });

  it('строки на коммит — в подсказке', () => {
    const lines = buildHourlyDrill(base).highlights?.at(-1);

    // formatNumber разделяет разряды неразрывным пробелом — сверяемся с ним самим.
    expect(lines?.value).toBe(formatNumber(1240));
    expect(lines?.hint).toBe('~155 на коммит');
  });

  it('пустой период не делит на ноль', () => {
    const content = buildHourlyDrill({
      ...base,
      commits: 0,
      addedLines: 0,
      totalCommits: 0,
      weekdayCommits: 0,
      hourCommits: 0,
    });

    expect(content.highlights?.map((h) => h.value)).toEqual(['0.0%', '0%', '0%', '0']);
    expect(content.highlights?.at(-1)?.hint).toBeUndefined();
  });
});

describe('buildHourlyDrill: авторы ячейки', () => {
  const enrichment = new Map([
    ['a@x.ru', { displayName: 'Анна', avatarUrl: null, team: 'Маркировка', isLead: true }],
  ]);

  it('строит разбивку по авторам, по убыванию коммитов', () => {
    const rows = buildHourlyDrill({
      ...base,
      authors: [
        { email: 'b@x.ru', commits: 2 },
        { email: 'a@x.ru', commits: 6, addedLines: 900 },
      ],
      enrichment,
    }).rows;

    expect(rows.map((r) => r.email)).toEqual(['a@x.ru', 'b@x.ru']);
    expect(rows[0]?.displayName).toBe('Анна');
    expect(rows[0]?.team).toBe('Маркировка');
    expect(rows[0]?.isLead).toBe(true);
  });

  it('не полагается на порядок с бэка, хотя контракт обещает убывание', () => {
    const rows = buildHourlyDrill({
      ...base,
      authors: [
        { email: 'c@x.ru', commits: 1 },
        { email: 'd@x.ru', commits: 9 },
      ],
    }).rows;

    expect(rows[0]?.email).toBe('d@x.ru');
  });

  it('автора нет в enrichment — строка остаётся, но без имени и команды', () => {
    const rows = buildHourlyDrill({ ...base, authors: [{ email: 'z@x.ru', commits: 3 }] }).rows;

    expect(rows[0]).toMatchObject({ email: 'z@x.ru', displayName: null, team: null });
  });

  it('addedLines опциональны — без них у строки только коммиты', () => {
    const rows = buildHourlyDrill({ ...base, authors: [{ email: 'a@x.ru', commits: 3 }] }).rows;

    expect(rows[0]?.stats.map((s) => s.label)).toEqual(['Коммиты']);
  });

  it('ответ старого бэка без authors — только цифры среза, без пустого списка', () => {
    const content = buildHourlyDrill(base);

    expect(content.rows).toEqual([]);
    expect(content.highlights).toHaveLength(4);
  });
});
