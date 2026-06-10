import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { FilterUrlSync } from './FilterUrlSync';
import { useDateRangeStore } from '@/features/date-range-filter';
import { ALL_TEAMS, useTeamScopeStore } from '@/features/team-scope';

/**
 * Минимальный probe-компонент: вытаскивает текущий location в текст,
 * чтобы тесты могли ассертить ожидаемый ?query=… после sync.
 */
function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname + loc.search}</div>;
}

const renderAt = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <FilterUrlSync />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );

const FALLBACK_RANGE = { from: '2026-05-01', to: '2026-05-31' };

describe('<FilterUrlSync>', () => {
  beforeEach(() => {
    useDateRangeStore.getState().setCustom(FALLBACK_RANGE);
    useTeamScopeStore.getState().reset();
  });
  afterEach(() => {
    useDateRangeStore.getState().setCustom(FALLBACK_RANGE);
    useTeamScopeStore.getState().reset();
  });

  it('URL → store: ?from/?to из URL применяются в date-range', async () => {
    renderAt('/?from=2026-01-01&to=2026-03-31');
    await waitFor(() => {
      const range = useDateRangeStore.getState().range;
      expect(range.from).toBe('2026-01-01');
      expect(range.to).toBe('2026-03-31');
    });
  });

  it('URL → store: ?team из URL применяется в скоп', async () => {
    renderAt('/?team=Маркировка');
    await waitFor(() => {
      expect(useTeamScopeStore.getState().scope).toBe('Маркировка');
    });
  });

  it('store → URL: смена скопа дописывает ?team= в URL', async () => {
    const { getByTestId } = renderAt('/');
    // Изменяем стор → эффект должен прописать team в URL.
    useTeamScopeStore.getState().setScope('Маркировка');
    await waitFor(() => {
      const url = getByTestId('location').textContent ?? '';
      expect(url).toContain('team=');
      // URLSearchParams encode'ит кириллицу — сравниваем через decode.
      const params = new URLSearchParams(url.split('?')[1]);
      expect(params.get('team')).toBe('Маркировка');
    });
  });

  it('ALL_TEAMS не пишется в URL — чистый URL = вся компания', async () => {
    const { getByTestId } = renderAt('/?team=Маркировка');
    await waitFor(() => {
      expect(useTeamScopeStore.getState().scope).toBe('Маркировка');
    });
    // Сбрасываем скоп вручную, чтобы синк удалил параметр.
    useTeamScopeStore.getState().setScope(ALL_TEAMS);
    await waitFor(() => {
      expect(getByTestId('location').textContent).not.toContain('team=');
    });
  });

  it('URL без team — НЕ сбрасывает persisted скоп (фикс из Stage 49)', async () => {
    useTeamScopeStore.getState().setScope('Платформа');
    renderAt('/users/x@x5.ru?from=2026-01-01&to=2026-03-31');
    await waitFor(() => {
      // store→URL допишет team, но скоп в сторе не должен слететь в ALL_TEAMS.
      expect(useTeamScopeStore.getState().scope).toBe('Платформа');
    });
  });
});
