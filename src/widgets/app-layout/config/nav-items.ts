import type { LucideIcon } from 'lucide-react';
import { Activity, BarChart3, Bug, CalendarClock, CalendarDays, ClipboardCheck, GitCompare, GitMerge, LayoutGrid, Layers, UsersRound } from 'lucide-react';
import { ROUTES } from '@/app/router/paths';

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
  matchPaths?: readonly string[];
  /** Виден только ADMIN/TEAMLEAD (RBAC, ADR-13). Для MEMBER скрыт. */
  requiresElevated?: boolean;
}

/**
 * Разделы сайдбара — только аналитика.
 *
 * Служебное (сбор данных, настройки) переехало в меню профиля: оно нужно редко,
 * а место в основной навигации занимало наравне с рабочими разделами. Профиль тоже
 * не здесь — открывается кликом по строке автора или из меню.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    key: 'dashboard',
    label: 'Дашборд',
    icon: LayoutGrid,
    path: ROUTES.dashboard,
  },
  {
    key: 'weekly',
    label: 'Недели',
    icon: CalendarDays,
    path: ROUTES.weekly,
  },
  {
    key: 'activity',
    label: 'Активность',
    icon: Activity,
    path: ROUTES.activity,
  },
  {
    key: 'defects',
    label: 'Дефекты',
    icon: Bug,
    path: ROUTES.defects,
  },
  {
    key: 'merged-mrs',
    label: 'Вмерженные MR',
    icon: GitMerge,
    path: ROUTES.mergedMrs,
  },
  {
    key: 'timesheet',
    label: 'Таймшит',
    icon: CalendarClock,
    path: ROUTES.timesheet,
  },
  {
    key: 'compare',
    label: 'Сравнение',
    icon: GitCompare,
    path: ROUTES.compare,
    requiresElevated: true,
  },
  {
    key: 'performance-review',
    label: 'Performance Review',
    icon: ClipboardCheck,
    path: ROUTES.performanceReview,
  },
  {
    key: 'cohorts',
    label: 'Когорты',
    icon: Layers,
    path: ROUTES.cohorts,
    requiresElevated: true,
  },
  {
    key: 'teams',
    label: 'Команды',
    icon: UsersRound,
    path: ROUTES.teams,
    requiresElevated: true,
  },
];

export const PRIMARY_NAV: readonly NavItem[] = NAV_ITEMS;

export const BRAND_ICON = BarChart3;
