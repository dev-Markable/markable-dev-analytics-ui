import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDateRangeStore } from '@/features/date-range-filter';
import { useTeamFilterStore } from '@/features/team-filter';
import { isValidRange } from '@/shared/lib';

/**
 * Двусторонняя синхронизация глобальных фильтров с URL query.
 *
 * `?from=YYYY-MM-DD&to=YYYY-MM-DD&team=1`
 *
 * - **URL → store:** при заходе по диплинку / навигации назад-вперёд параметры
 *   из URL применяются в сторы.
 * - **store → URL:** при смене фильтра (date picker, team toggle) или переходе
 *   на другую страницу URL переписывается из сторов — query «прилипает» к любому
 *   маршруту, остаётся актуальным диплинком.
 *
 * Циклы URL↔store↔URL затухают за счёт сравнения значений перед каждым `set`:
 * если значение уже совпадает — записи нет.
 *
 * Рендерит `null`. Монтируется один раз внутри Router.
 */
export function FilterUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  const range = useDateRangeStore((s) => s.range);
  const setCustom = useDateRangeStore((s) => s.setCustom);
  const teamEnabled = useTeamFilterStore((s) => s.enabled);
  const setTeamEnabled = useTeamFilterStore((s) => s.setEnabled);

  // URL → store
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to && (from !== range.from || to !== range.to)) {
      if (isValidRange({ from, to })) setCustom({ from, to });
    }

    const team = searchParams.get('team') === '1';
    if (team !== teamEnabled) setTeamEnabled(team);
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
    const teamParam = teamEnabled ? '1' : null;
    if (next.get('team') !== teamParam) {
      if (teamParam) next.set('team', teamParam);
      else next.delete('team');
      changed = true;
    }

    if (changed) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to, teamEnabled, pathname]);

  return null;
}
