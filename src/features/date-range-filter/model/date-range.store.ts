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
    {
      name: 'devpulse.date-range',
      // Пресеты относительные («последние N дней», «с начала месяца»).
      // Персистнутый `range` заморожен на момент сохранения — при наличии
      // `presetKey` пересобираем его на сегодня при рехидратации, иначе
      // вернувшийся завтра пользователь увидит вчерашнее окно.
      // Custom-диапазон (`presetKey === null`) оставляем как есть — его
      // пользователь выбрал явными датами.
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<DateRangeState>) };
        if (merged.presetKey) {
          const preset = DATE_RANGE_PRESETS.find((p) => p.key === merged.presetKey);
          if (preset) merged.range = preset.build();
        }
        return merged;
      },
    },
  ),
);

export const useDateRange = (): DateRange => useDateRangeStore((s) => s.range);
