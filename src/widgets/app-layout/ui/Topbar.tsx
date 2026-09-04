import { Space } from 'antd';
import { DateRangeFilter } from '@/features/date-range-filter';
import { TeamScopePicker } from '@/features/team-scope';
import { CommandTrigger } from '@/features/command-palette';
import { DataFreshness } from './DataFreshness';

/**
 * Топбар в три зоны: слева глобальные фильтры, по центру — поиск (командная палитра),
 * справа — свежесть данных. Центральная зона тянется, поэтому поиск всегда по центру
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

      {/* Справа — когда данные обновлялись: тихая подпись, клик ведёт
          на страницу сбора. Пустой её возвращать незачем. */}
      <span className="app-topbar__side app-topbar__side--end">
        <DataFreshness />
      </span>
    </header>
  );
}
