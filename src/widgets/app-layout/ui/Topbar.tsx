import { Space } from 'antd';
import { DateRangeFilter } from '@/features/date-range-filter';
import { TeamScopePicker } from '@/features/team-scope';
import { ThemeSwitch } from '@/features/theme-switch';

export function Topbar() {
  return (
    <header className="app-topbar">
      <Space size={12} align="center">
        <DateRangeFilter />
        <TeamScopePicker />
      </Space>
      <Space size={12} align="center">
        <ThemeSwitch />
      </Space>
    </header>
  );
}
