import { useEffect, useRef } from 'react';
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
 * Архитектурно — два **направленных** потока, без `eslint-disable`:
 *
 * 1. **URL → store** срабатывает только когда меняется `searchParams`
 *    (deeplink, back/forward, ручная правка). Текущее состояние стора читается
 *    через `ref`, чтобы не попасть в deps эффекта и не зациклиться.
 *
 * 2. **Store → URL** срабатывает только когда меняется сам стор или `pathname`
 *    (перенос query на новый маршрут). Текущее значение `searchParams` тоже
 *    читается через `ref` — без добавления в deps.
 *
 * Циклы URL↔store↔URL невозможны: каждый эффект пишет только в «свою»
 * сторону и сравнивает значения перед записью.
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

  // Refs «текущего состояния» — читаем внутри эффектов, не пишем в deps.
  const rangeRef = useRef(range);
  rangeRef.current = range;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // URL — источник правды на старте. Store→URL не должен срабатывать на самом
  // первом mount: иначе если URL и store расходятся (deeplink), оба эффекта
  // пишут противоположные значения и зацикливаются. После mount — нормальная
  // работа: пользователь меняет фильтр → URL обновляется.
  const skipNextStoreToUrl = useRef(true);

  // 1. URL → store. Только реактивен на searchParams; функции из Zustand
  //    стабильны (одна ссылка на жизнь стора), поэтому их в deps не пишем
  //    (ESLint доверяет нам — деструктур из useStore не считается зависимостью).
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const currentRange = rangeRef.current;
    if (
      from &&
      to &&
      (from !== currentRange.from || to !== currentRange.to) &&
      isValidRange({ from, to })
    ) {
      setCustom({ from, to });
    }

    // Скоп команды читаем из URL ТОЛЬКО когда параметр явно указан. Иначе
    // переходы по ссылкам без ?team= (напр. ссылка на профиль) сбрасывали бы
    // выбранную команду — а persistent store-значение должно пережить такие
    // переходы. Если параметра нет, эффект «store → URL» допишет его сам.
    const team = searchParams.get('team');
    if (team && team.length > 0 && team !== scopeRef.current) {
      setScope(team);
    }
  }, [searchParams, setCustom, setScope]);

  // 2. Store → URL. Реактивен на изменения стора или pathname; текущее
  //    значение searchParams читается через ref. setSearchParams в react-router 6
  //    стабильна, поэтому её можно класть в deps без боли.
  useEffect(() => {
    if (skipNextStoreToUrl.current) {
      skipNextStoreToUrl.current = false;
      return;
    }
    const next = new URLSearchParams(searchParamsRef.current);
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
  }, [range.from, range.to, scope, pathname, setSearchParams]);

  return null;
}
