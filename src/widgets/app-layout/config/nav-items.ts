import type { LucideIcon } from 'lucide-react';
import { Activity, BarChart3, CalendarDays, ClipboardCheck, GitCompare, LayoutGrid, RefreshCcw, Settings } from 'lucide-react';
import { ROUTES } from '@/app/router/paths';

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
  matchPaths?: readonly string[];
  group: 'primary' | 'secondary';
}

/**
 * Профиль не в сайдбаре — открывается кликом по строке автора
 * на дашборде / в недельках. Нет концепции «текущий юзер»,
 * поэтому единственного дефолтного email для пункта меню нет.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    key: 'dashboard',
    label: 'Дашборд',
    icon: LayoutGrid,
    path: ROUTES.dashboard,
    group: 'primary',
  },
  {
    key: 'weekly',
    label: 'Недели',
    icon: CalendarDays,
    path: ROUTES.weekly,
    group: 'primary',
  },
  {
    key: 'activity',
    label: 'Активность',
    icon: Activity,
    path: ROUTES.activity,
    group: 'primary',
  },
  {
    key: 'compare',
    label: 'Сравнение',
    icon: GitCompare,
    path: ROUTES.compare,
    group: 'primary',
  },
  {
    key: 'performance-review',
    label: 'Performance Review',
    icon: ClipboardCheck,
    path: ROUTES.performanceReview,
    group: 'primary',
  },
  {
    key: 'collection',
    label: 'Сбор',
    icon: RefreshCcw,
    path: ROUTES.collection,
    group: 'secondary',
  },
  {
    key: 'settings',
    label: 'Настройки',
    icon: Settings,
    path: ROUTES.settings,
    group: 'secondary',
  },
];

export const SECONDARY_NAV: readonly NavItem[] = NAV_ITEMS.filter((i) => i.group === 'secondary');
export const PRIMARY_NAV: readonly NavItem[] = NAV_ITEMS.filter((i) => i.group === 'primary');

export const BRAND_ICON = BarChart3;
