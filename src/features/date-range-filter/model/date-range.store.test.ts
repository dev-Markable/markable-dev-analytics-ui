// @vitest-environment jsdom
// Стор использует localStorage (persist) — нужен DOM-env, а не node.
import { describe, it, expect, beforeEach } from 'vitest';
import { useDateRangeStore } from './date-range.store';
import { DATE_RANGE_PRESETS } from '@/shared/lib';

const KEY = 'devpulse.date-range';

const seed = (state: { presetKey: string | null; range: { from: string; to: string } }) => {
  localStorage.setItem(KEY, JSON.stringify({ state, version: 0 }));
};

describe('date-range.store · рехидратация', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('пересобирает range из presetKey — относительный пресет не залипает на дате сохранения', async () => {
    const stale = { from: '2000-01-01', to: '2000-01-30' };
    seed({ presetKey: '30d', range: stale });

    await useDateRangeStore.persist.rehydrate();

    const fresh = DATE_RANGE_PRESETS.find((p) => p.key === '30d')!.build();
    expect(useDateRangeStore.getState().range).toEqual(fresh);
    expect(useDateRangeStore.getState().range).not.toEqual(stale);
    expect(useDateRangeStore.getState().presetKey).toBe('30d');
  });

  it('сохраняет custom-диапазон (presetKey === null) как есть', async () => {
    const custom = { from: '2024-03-01', to: '2024-03-15' };
    seed({ presetKey: null, range: custom });

    await useDateRangeStore.persist.rehydrate();

    expect(useDateRangeStore.getState().range).toEqual(custom);
    expect(useDateRangeStore.getState().presetKey).toBeNull();
  });
});
