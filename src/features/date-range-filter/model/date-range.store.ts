import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DATE_RANGE_PRESETS,
  DEFAULT_PRESET_KEY,
  isValidRange,
  lastNDays,
  type DateRange,
} from '@/shared/lib';

interface DateRangeState {
  presetKey: string | null;
  range: DateRange;
  setPreset: (key: string) => void;
  setCustom: (range: DateRange) => void;
}

const buildInitial = (): DateRange => {
  const preset = DATE_RANGE_PRESETS.find((p) => p.key === DEFAULT_PRESET_KEY);
  return preset ? preset.build() : lastNDays(30);
};

export const useDateRangeStore = create<DateRangeState>()(
  persist(
    (set) => ({
      presetKey: DEFAULT_PRESET_KEY,
      range: buildInitial(),
      setPreset: (key) => {
        const preset = DATE_RANGE_PRESETS.find((p) => p.key === key);
        if (!preset) return;
        set({ presetKey: key, range: preset.build() });
      },
      setCustom: (range) => {
        if (!isValidRange(range)) return;
        set({ presetKey: null, range });
      },
    }),
    { name: 'markable.date-range' },
  ),
);

export const useDateRange = (): DateRange => useDateRangeStore((s) => s.range);
