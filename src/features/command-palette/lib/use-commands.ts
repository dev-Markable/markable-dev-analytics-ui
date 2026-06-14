import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  GitCompare,
  Globe,
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
import { usersQuery } from '@/entities/user';
import { teamsQuery } from '@/entities/team';
import { ROUTES, buildProfilePath } from '@/app/router/paths';
import type { Command } from './match';

/**
 * Страницы для навигации палитры. Описаны локально (через ROUTES), а не взяты из
 * widgets/app-layout — features не должны импортировать widgets (правило слоёв).
 */
const PAGES: readonly { label: string; icon: LucideIcon; path: string }[] = [
  { label: 'Дашборд', icon: LayoutGrid, path: ROUTES.dashboard },
  { label: 'Недели', icon: CalendarDays, path: ROUTES.weekly },
  { label: 'Активность', icon: Activity, path: ROUTES.activity },
  { label: 'Сравнение', icon: GitCompare, path: ROUTES.compare },
  { label: 'Performance Review', icon: ClipboardCheck, path: ROUTES.performanceReview },
  { label: 'Команды', icon: UsersRound, path: ROUTES.teams },
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

  const usersQ = useQuery({ ...usersQuery(), enabled: open });
  const teamsQ = useQuery({ ...teamsQuery(), enabled: open });

  return useMemo(() => {
    const commands: Command[] = [];

    for (const page of PAGES) {
      commands.push({
        id: `nav:${page.path}`,
        group: 'Навигация',
        label: page.label,
        icon: page.icon,
        keywords: 'страница перейти',
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
  }, [navigate, setPreset, setScope, range, teamsQ.data, usersQ.data]);
}
