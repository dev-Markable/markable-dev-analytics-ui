import { Space } from 'antd';
import { DateRangeFilter } from '@/features/date-range-filter';
import { TeamFilterToggle } from '@/features/team-filter';
import { ThemeSwitch } from '@/features/theme-switch';

export function Topbar() {
  return (
    <header className="app-topbar">
      <Space size={12} align="center">
        <DateRangeFilter />
      </Space>
      <Space size={12} align="center">
        <TeamFilterToggle />
        <ThemeSwitch />
      </Space>
    </header>
  );
}
