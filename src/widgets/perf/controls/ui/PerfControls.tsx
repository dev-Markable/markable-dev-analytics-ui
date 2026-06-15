import { useMemo } from 'react';
import { DatePicker, Segmented, Select, Space, Switch, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { UserAvatar, userDisplayName, usersQuery } from '@/entities/user';
import { matchesScope, useTeamScope } from '@/features/team-scope';
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
  /** MEMBER видит только своё досье (RBAC, ADR-13) — выбор разработчика заблокирован. */
  emailLocked?: boolean;
}

export function PerfControls({
  email,
  range,
  compare,
  onEmailChange,
  onRangeChange,
  onCompareChange,
  emailLocked = false,
}: PerfControlsProps) {
  const usersQ = useQuery(usersQuery());
  // Команда — из глобального скопа в топбаре; локального дубля нет.
  const scope = useTeamScope();

  const users = useMemo(() => usersQ.data ?? [], [usersQ.data]);

  // Опции с привязкой целого пользователя — нужен для optionRender (аватар, лид, команда)
  // и для filterOption (поиск по имени + email + команде).
  const options = useMemo(
    () =>
      [...users]
        .filter((u) => matchesScope(u.team ?? null, scope))
        .sort((a, b) => userDisplayName(a).localeCompare(userDisplayName(b)))
        .map((u) => ({
          value: u.email,
          label: userDisplayName(u),
          user: u,
        })),
    [users, scope],
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
          disabled={emailLocked}
          value={email ?? undefined}
          placeholder="Выберите разработчика"
          loading={usersQ.isPending}
          options={options}
          onChange={onEmailChange}
          optionFilterProp="label"
          style={{ width: '100%' }}
          size="large"
          filterOption={(input, option) => {
            const q = input.toLowerCase();
            const u = option?.user;
            if (!u) return false;
            return (
              u.email.toLowerCase().includes(q) ||
              userDisplayName(u).toLowerCase().includes(q) ||
              (u.team?.toLowerCase().includes(q) ?? false)
            );
          }}
          optionRender={(opt) => {
            const u = opt.data.user;
            return (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <UserAvatar user={u} size={28} isLead={u.isLead} />
                <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.2, minWidth: 0 }}>
                  <span>{userDisplayName(u)}</span>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {u.email}
                    {u.team && <> · {u.team}</>}
                  </Typography.Text>
                </span>
              </span>
            );
          }}
          notFoundContent="Никого не найдено"
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
