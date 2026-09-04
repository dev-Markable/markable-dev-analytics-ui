import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Bug,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  GitCompare,
  GitMerge,
  Globe,
  Layers,
  LayoutGrid,
  RefreshCcw,
  Settings,
  UserX,
  Users,
  UsersRound,
} from 'lucide-react';
import { DATE_RANGE_PRESETS } from '@/shared/lib';
import { useDateRange, useDateRangeStore } from '@/features/date-range-filter';
import { ALL_TEAMS, NO_TEAM, useTeamScopeStore } from '@/features/team-scope';
import { isElevated, useCurrentUser } from '@/entities/auth';
import { usersQuery } from '@/entities/user';
import { teamsQuery } from '@/entities/team';
import { ROUTES, buildProfilePath } from '@/app/router/paths';
import type { Command } from './match';

interface PalettePage {
  label: string;
  icon: LucideIcon;
  path: string;
  keywords?: string;
  /** Раздел только для ADMIN/TEAMLEAD (RBAC, ADR-13) — MEMBER'у в палитре не показываем. */
  requiresElevated?: boolean;
}

/**
 * Страницы для навигации палитры. Описаны локально (через ROUTES), а не взяты из
 * widgets/app-layout — features не должны импортировать widgets (правило слоёв).
 * Список держим в синхроне с `widgets/app-layout/config/nav-items.ts`.
 */
const PAGES: readonly PalettePage[] = [
  { label: 'Дашборд', icon: LayoutGrid, path: ROUTES.dashboard },
  { label: 'Недели', icon: CalendarDays, path: ROUTES.weekly },
  { label: 'Активность', icon: Activity, path: ROUTES.activity },
  { label: 'Дефекты', icon: Bug, path: ROUTES.defects, keywords: 'дефекты баги приоритет ai' },
  { label: 'Вмерженные MR', icon: GitMerge, path: ROUTES.mergedMrs, keywords: 'мр merge request' },
  { label: 'Таймшит', icon: CalendarClock, path: ROUTES.timesheet, keywords: 'трудозатраты часы время' },
  { label: 'Сравнение', icon: GitCompare, path: ROUTES.compare, requiresElevated: true },
  { label: 'Performance Review', icon: ClipboardCheck, path: ROUTES.performanceReview },
  { label: 'Когорты', icon: Layers, path: ROUTES.cohorts, requiresElevated: true },
  { label: 'Команды', icon: UsersRound, path: ROUTES.teams, requiresElevated: true },
  { label: 'Сбор', icon: RefreshCcw, path: ROUTES.collection },
  { label: 'Настройки', icon: Settings, path: ROUTES.settings },
];

/**
 * Собирает плоский список команд палитры в порядке групп. Справочники
 * (пользователи, команды) грузятся только когда палитра открыта (`enabled`).
 */
export function useCommands(open: boolean): Command[] {
  const navigate = useNavigate();
  const setPreset = useDateRangeStore((s) => s.setPreset);
  const setScope = useTeamScopeStore((s) => s.setScope);
  const range = useDateRange();

  const { data: me } = useCurrentUser();
  const elevated = me ? isElevated(me.role) : false;

  const usersQ = useQuery({ ...usersQuery(), enabled: open });
  const teamsQ = useQuery({ ...teamsQuery(), enabled: open });

  return useMemo(() => {
    const commands: Command[] = [];

    for (const page of PAGES) {
      // MEMBER'у elevated-разделы не показываем: он всё равно был бы уведён гардом.
      if (page.requiresElevated && !elevated) {
        continue;
      }
      commands.push({
        id: `nav:${page.path}`,
        group: 'Навигация',
        label: page.label,
        icon: page.icon,
        keywords: `страница перейти ${page.keywords ?? ''}`,
        run: () => navigate(page.path),
      });
    }

    for (const p of DATE_RANGE_PRESETS) {
      commands.push({
        id: `period:${p.key}`,
        group: 'Период',
        label: p.label,
        icon: CalendarRange,
        keywords: 'период даты фильтр',
        run: () => setPreset(p.key),
      });
    }

    commands.push(
      {
        id: 'team:all',
        group: 'Команды',
        label: 'Все команды',
        icon: Globe,
        keywords: 'сбросить фильтр команды',
        run: () => setScope(ALL_TEAMS),
      },
      {
        id: 'team:none',
        group: 'Команды',
        label: 'Без команды',
        icon: UserX,
        keywords: 'фильтр команды нет',
        run: () => setScope(NO_TEAM),
      },
    );
    for (const team of teamsQ.data ?? []) {
      commands.push({
        id: `team:${team.name}`,
        group: 'Команды',
        label: team.name,
        hint: `${team.members.length} участн.`,
        icon: Users,
        keywords: 'команда фильтр',
        run: () => setScope(team.name),
      });
    }

    for (const u of usersQ.data ?? []) {
      commands.push({
        id: `user:${u.email}`,
        group: 'Разработчики',
        label: u.name ?? u.email,
        hint: u.team ? `${u.email} · ${u.team}` : u.email,
        user: u,
        keywords: 'профиль разработчик',
        run: () => navigate(buildProfilePath(u.email, range)),
      });
    }

    return commands;
  }, [navigate, setPreset, setScope, range, elevated, teamsQ.data, usersQ.data]);
}
