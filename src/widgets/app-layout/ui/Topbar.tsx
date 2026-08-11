import { Space } from 'antd';
import { DateRangeFilter } from '@/features/date-range-filter';
import { TeamScopePicker } from '@/features/team-scope';
import { ThemeSwitch } from '@/features/theme-switch';
import { CommandTrigger } from '@/features/command-palette';
import { UserMenu } from './UserMenu';

/**
 * Топбар в три зоны: слева глобальные фильтры, по центру — поиск (командная палитра),
 * справа — тема и профиль. Центральная зона тянется, поэтому поиск всегда по центру
 * страницы независимо от ширины фильтров.
 */
export function Topbar() {
  return (
    <header className="app-topbar">
      <Space className="app-topbar__side" size={12} align="center">
        <DateRangeFilter />
        <TeamScopePicker />
      </Space>

      <div className="app-topbar__center">
        <CommandTrigger />
      </div>

      <Space className="app-topbar__side app-topbar__side--end" size={12} align="center">
        <ThemeSwitch />
        <UserMenu />
      </Space>
    </header>
  );
}
