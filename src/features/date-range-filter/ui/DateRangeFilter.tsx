import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { dayjs, DATE_RANGE_PRESETS, toISODate } from '@/shared/lib';
import { useDateRangeStore } from '../model/date-range.store';

const { RangePicker } = DatePicker;

const presets = DATE_RANGE_PRESETS.map((p) => ({
  label: p.label,
  value: () => {
    const r = p.build();
    return [dayjs(r.from), dayjs(r.to)] as [Dayjs, Dayjs];
  },
}));

interface DateRangeFilterProps {
  allowClear?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export function DateRangeFilter({ allowClear = false, size = 'middle' }: DateRangeFilterProps) {
  const range = useDateRangeStore((s) => s.range);
  const setCustom = useDateRangeStore((s) => s.setCustom);

  return (
    <RangePicker
      size={size}
      value={[dayjs(range.from), dayjs(range.to)]}
      onChange={(values) => {
        if (values?.[0] && values?.[1]) {
          setCustom({ from: toISODate(values[0]), to: toISODate(values[1]) });
        }
      }}
      presets={presets}
      allowClear={allowClear}
      format="D MMM YYYY"
      placeholder={['Начало', 'Конец']}
      style={{ minWidth: 280 }}
    />
  );
}
