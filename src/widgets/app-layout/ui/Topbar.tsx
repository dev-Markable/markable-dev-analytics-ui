import { Space } from 'antd';
import { DateRangeFilter } from '@/features/date-range-filter';
import { TeamScopePicker } from '@/features/team-scope';
import { ThemeSwitch } from '@/features/theme-switch';
import { CommandTrigger } from '@/features/command-palette';

export function Topbar() {
  return (
    <header className="app-topbar">
      <Space size={12} align="center">
        <DateRangeFilter />
        <TeamScopePicker />
      </Space>
      <Space size={12} align="center">
        <CommandTrigger />
        <ThemeSwitch />
      </Space>
    </header>
  );
}
