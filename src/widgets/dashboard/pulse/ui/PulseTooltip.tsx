import type { TooltipProps } from 'recharts';
import { ChartTooltip } from '@/shared/ui';
import { dayjs, formatNumber } from '@/shared/lib';
import type { PulsePoint } from '../lib/aggregate-pulse';

/** Тултип пульса: дата + коммиты, авторы, строки за этот день. */
export function PulseTooltip({ active, payload }: TooltipProps<number, string>) {
  const point = payload?.[0]?.payload as PulsePoint | undefined;
  if (!active || !point) return null;

  return (
    <ChartTooltip
      title={dayjs(point.date).format('D MMMM, dddd')}
      rows={[
        { label: 'Коммиты', swatch: 'var(--ant-color-primary)', value: formatNumber(point.commits) },
        { label: 'Авторов', value: String(point.authors) },
        { label: 'Строк добавлено', value: formatNumber(point.addedLines) },
      ]}
    />
  );
}
