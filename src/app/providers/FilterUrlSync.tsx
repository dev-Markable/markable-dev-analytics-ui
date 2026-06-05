import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDateRangeStore } from '@/features/date-range-filter';
import { ALL_TEAMS, useTeamScopeStore } from '@/features/team-scope';
import { isValidRange } from '@/shared/lib';

/**
 * Двусторонняя синхронизация глобальных фильтров с URL query.
 *
 * `?from=YYYY-MM-DD&to=YYYY-MM-DD&team=<name|__none__>`
 *
 * Скоп `__all__` (вся компания) в URL не пишется — это значение по умолчанию,
 * чистый URL = вся компания. `__none__` и имена команд пишутся как есть.
 *
 * - **URL → store:** при заходе по диплинку / навигации назад-вперёд параметры
 *   из URL применяются в сторы.
 * - **store → URL:** при смене фильтра или переходе на другую страницу URL
 *   переписывается из сторов — query «прилипает» к любому маршруту.
 *
 * Циклы URL↔store↔URL затухают за счёт сравнения значений перед каждым `set`.
 *
 * Рендерит `null`. Монтируется один раз внутри Router.
 */
export function FilterUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  const range = useDateRangeStore((s) => s.range);
  const setCustom = useDateRangeStore((s) => s.setCustom);
  const scope = useTeamScopeStore((s) => s.scope);
  const setScope = useTeamScopeStore((s) => s.setScope);

  // URL → store
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to && (from !== range.from || to !== range.to)) {
      if (isValidRange({ from, to })) setCustom({ from, to });
    }

    const team = searchParams.get('team');
    const nextScope = team && team.length > 0 ? team : ALL_TEAMS;
    if (nextScope !== scope) setScope(nextScope);
    // Намеренно зависим только от searchParams: реагируем на изменение URL,
    // а не на изменение стора (обратное направление — во втором эффекте).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // store → URL (включая смену pathname — query переносится на новый маршрут)
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;

    if (next.get('from') !== range.from) {
      next.set('from', range.from);
      changed = true;
    }
    if (next.get('to') !== range.to) {
      next.set('to', range.to);
      changed = true;
    }
    const teamParam = scope === ALL_TEAMS ? null : scope;
    if (next.get('team') !== teamParam) {
      if (teamParam) next.set('team', teamParam);
      else next.delete('team');
      changed = true;
    }

    if (changed) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to, scope, pathname]);

  return null;
}
