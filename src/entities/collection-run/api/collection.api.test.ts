import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as SharedApi from '@/shared/api';
import { ApiError } from '@/shared/api';
import { cancelCollectionRun, getLatestRun } from './collection.api';

const get = vi.fn();
const post = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedApi>();
  return {
    ...actual,
    apiClient: {
      get: (...a: unknown[]) => get(...a),
      post: (...a: unknown[]) => post(...a),
    },
  };
});

const RUN = {
  id: 'run-1',
  startedAt: '2026-05-23T14:00:00',
  finishedAt: null,
  sinceDate: '2026-05-10T00:00:00',
  untilDate: '2026-05-23T14:00:00',
  status: 'RUNNING' as const,
  errorMessage: null,
};

const apiError = (status: number) =>
  new ApiError({ status, type: 'about:blank', title: 'x' });

afterEach(() => {
  get.mockReset();
  post.mockReset();
});

describe('getLatestRun', () => {
  it('возвращает прогон при 200', async () => {
    get.mockResolvedValue({ data: RUN });
    await expect(getLatestRun()).resolves.toEqual(RUN);
    expect(get).toHaveBeenCalledWith('/collection/runs/latest');
  });

  it('404 → null (прогонов ещё не было — не ошибка)', async () => {
    get.mockRejectedValue(apiError(404));
    await expect(getLatestRun()).resolves.toBeNull();
  });

  it('прочие ошибки пробрасываются', async () => {
    get.mockRejectedValue(apiError(500));
    await expect(getLatestRun()).rejects.toMatchObject({ status: 500 });
  });
});

describe('cancelCollectionRun', () => {
  it('POST на /cancel с экранированным id, возвращает тело 202', async () => {
    post.mockResolvedValue({ data: { ...RUN, status: 'RUNNING' } });
    await expect(cancelCollectionRun('a/b')).resolves.toMatchObject({ status: 'RUNNING' });
    expect(post).toHaveBeenCalledWith('/collection/runs/a%2Fb/cancel');
  });
});
