import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  asyncFailure,
  asyncLoading,
  asyncSuccess,
  idleAsyncState,
  isFresh,
} from './async-state';
import { ApiError } from './api-error';

const FROZEN_NOW = 1_700_000_000_000;

describe('async-state хелперы', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('idleAsyncState — пустой shape без таймстампа', () => {
    const s = idleAsyncState<number>();
    expect(s).toEqual({ data: null, status: 'idle', error: null, lastFetchedAt: null });
  });

  it('asyncLoading сохраняет data из prev и сбрасывает error', () => {
    const prev = asyncSuccess<number>(42);
    const next = asyncLoading(prev);
    expect(next.status).toBe('loading');
    expect(next.data).toBe(42); // показываем stale-data, пока грузим
    expect(next.error).toBeNull();
    expect(next.lastFetchedAt).toBe(FROZEN_NOW);
  });

  it('asyncSuccess фиксирует lastFetchedAt = now', () => {
    const s = asyncSuccess('ok');
    expect(s.status).toBe('success');
    expect(s.data).toBe('ok');
    expect(s.error).toBeNull();
    expect(s.lastFetchedAt).toBe(FROZEN_NOW);
  });

  it('asyncFailure сохраняет prev.data, ставит status=error', () => {
    const prev = asyncSuccess<number>(7);
    const err = new ApiError({ status: 500, type: 'about:blank', title: 'boom' });
    const next = asyncFailure(prev, err);
    expect(next.status).toBe('error');
    expect(next.data).toBe(7); // данные остаются для retry-fallback
    expect(next.error).toBe(err);
  });
});

describe('isFresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('idle-state не fresh', () => {
    expect(isFresh(idleAsyncState(), 60_000)).toBe(false);
  });

  it('только что записанный success — fresh', () => {
    const s = asyncSuccess('ok');
    expect(isFresh(s, 60_000)).toBe(true);
  });

  it('после ttl — не fresh (граница исключительна)', () => {
    const s = asyncSuccess('ok');
    vi.setSystemTime(FROZEN_NOW + 60_000);
    expect(isFresh(s, 60_000)).toBe(false);
  });

  it('за миллисекунду до ttl — ещё fresh', () => {
    const s = asyncSuccess('ok');
    vi.setSystemTime(FROZEN_NOW + 59_999);
    expect(isFresh(s, 60_000)).toBe(true);
  });
});
