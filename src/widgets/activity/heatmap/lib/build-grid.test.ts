import { describe, expect, it } from 'vitest';
import { makeDaily } from '@/shared/test/factories';
import { dayjs } from '@/shared/lib';
import { buildDayStrip, buildHeatmapGrid, DAY_STRIP_MAX_DAYS } from './build-grid';

describe('buildHeatmapGrid', () => {
  it('неделя схлопывается в одну колонку — ради этого и появилась лента', () => {
    // 3–9 августа 2026 — ровно одна ISO-неделя.
    const grid = buildHeatmapGrid([], { from: '2026-08-03', to: '2026-08-09' });

    expect(grid.columns).toBe(1);
  });
});

describe('buildDayStrip', () => {
  it('день на каждую дату периода', () => {
    const days = buildDayStrip([], { from: '2026-08-03', to: '2026-08-09' });

    expect(days).toHaveLength(7);
    expect(days[0]?.date).toBe('2026-08-03');
    expect(days.at(-1)?.date).toBe('2026-08-09');
  });

  it('размечает выходные и праздники', () => {
    const days = buildDayStrip([], { from: '2026-08-07', to: '2026-08-09' });

    expect(days.map((d) => d.kind)).toEqual(['working', 'weekend', 'weekend']);
    expect(buildDayStrip([], { from: '2026-06-12', to: '2026-06-12' })[0]?.kind).toBe('holiday');
  });

  it('схлопывает строки одного дня по авторам и репозиториям', () => {
    const days = buildDayStrip(
      [
        makeDaily({ date: '2026-08-03', email: 'a@x.ru', repo: 'core', commits: 2, addedLines: 10 }),
        makeDaily({ date: '2026-08-03', email: 'b@x.ru', repo: 'ui', commits: 3, addedLines: 5 }),
      ],
      { from: '2026-08-03', to: '2026-08-03' },
    );

    expect(days[0]).toMatchObject({ commits: 5, addedLines: 15, authors: 2, repos: 2 });
  });

  it('дни, ещё не наступившие, в ленту не попадают', () => {
    const today = dayjs().startOf('day');
    const from = today.subtract(1, 'day').format('YYYY-MM-DD');
    const to = today.add(5, 'day').format('YYYY-MM-DD');

    const days = buildDayStrip([], { from, to });

    expect(days).toHaveLength(2);
    expect(days.at(-1)?.date).toBe(today.format('YYYY-MM-DD'));
  });

  it('период длиннее порога ленты — карточка вернётся к сетке недель', () => {
    const days = buildDayStrip([], { from: '2026-07-01', to: '2026-07-31' });

    expect(days.length).toBeGreaterThan(DAY_STRIP_MAX_DAYS);
  });
});
