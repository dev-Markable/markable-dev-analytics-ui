import { useMemo } from 'react';
import { DatePicker, Segmented, Select, Space, Switch, Typography } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { useUsersStore } from '@/entities/user';
import { userDisplayName } from '@/entities/user';
import { dayjs, toISODate, type DateRange } from '@/shared/lib';
import {
  DEFAULT_PERF_PERIOD,
  PERF_PERIOD_PRESETS,
  detectPeriodKey,
  presetRange,
  type PerfPeriodKey,
} from '../config/periods';

const { RangePicker } = DatePicker;

interface PerfControlsProps {
  email: string | null;
  range: DateRange;
  compare: boolean;
  onEmailChange: (email: string) => void;
  onRangeChange: (range: DateRange) => void;
  onCompareChange: (compare: boolean) => void;
}

export function PerfControls({
  email,
  range,
  compare,
  onEmailChange,
  onRangeChange,
  onCompareChange,
}: PerfControlsProps) {
  const usersState = useUsersStore(useShallow((s) => s.state));
  const users = useMemo(() => usersState.data ?? [], [usersState.data]);

  const options = useMemo(
    () =>
      [...users]
        .sort((a, b) => userDisplayName(a).localeCompare(userDisplayName(b)))
        .map((u) => ({
          value: u.email,
          label: userDisplayName(u),
          team: u.team,
        })),
    [users],
  );

  const periodKey: PerfPeriodKey = detectPeriodKey(range);

  const handlePeriod = (key: PerfPeriodKey) => {
    if (key === 'custom') return;
    onRangeChange(presetRange(key));
  };

  return (
    <div className="perf-controls">
      <div className="perf-controls__field perf-controls__field--person">
        <Typography.Text type="secondary" className="perf-controls__label">
          Разработчик
        </Typography.Text>
        <Select
          showSearch
          value={email ?? undefined}
          placeholder="Выберите разработчика"
          loading={usersState.status === 'loading'}
          options={options}
          onChange={onEmailChange}
          optionFilterProp="label"
          style={{ width: '100%' }}
          size="large"
        />
      </div>

      <div className="perf-controls__field">
        <Typography.Text type="secondary" className="perf-controls__label">
          Период
        </Typography.Text>
        <Space size={8} wrap>
          <Segmented
            value={periodKey === 'custom' ? (DEFAULT_PERF_PERIOD as string) : periodKey}
            options={[
              ...PERF_PERIOD_PRESETS.map((p) => ({ value: p.key, label: p.label })),
              ...(periodKey === 'custom' ? [{ value: 'custom', label: 'Свой' }] : []),
            ]}
            onChange={(v) => handlePeriod(v as PerfPeriodKey)}
          />
          <RangePicker
            allowClear={false}
            value={[dayjs(range.from), dayjs(range.to)]}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                onRangeChange({ from: toISODate(dates[0]), to: toISODate(dates[1]) });
              }
            }}
            format="DD.MM.YYYY"
          />
        </Space>
      </div>

      <div className="perf-controls__field perf-controls__field--compare">
        <Typography.Text type="secondary" className="perf-controls__label">
          Сравнить с прошлым периодом
        </Typography.Text>
        <Switch checked={compare} onChange={onCompareChange} />
      </div>
    </div>
  );
}
