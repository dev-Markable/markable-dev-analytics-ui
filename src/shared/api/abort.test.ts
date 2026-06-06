import { describe, expect, it } from 'vitest';
import axios from 'axios';
import { isAbortError } from './abort';

describe('isAbortError', () => {
  it('axios.Cancel → true', () => {
    expect(isAbortError(new axios.Cancel('aborted'))).toBe(true);
  });

  it('CanceledError (новые версии axios) → true', () => {
    const err = Object.assign(new Error('canceled'), { name: 'CanceledError' });
    expect(isAbortError(err)).toBe(true);
  });

  it('DOMException AbortError → true', () => {
    const err = Object.assign(new Error('aborted'), { name: 'AbortError' });
    expect(isAbortError(err)).toBe(true);
  });

  it('code ERR_CANCELED → true', () => {
    const err = Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' });
    expect(isAbortError(err)).toBe(true);
  });

  it('обычная ошибка → false', () => {
    expect(isAbortError(new Error('boom'))).toBe(false);
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
    expect(isAbortError('string')).toBe(false);
    expect(isAbortError({ name: 'TypeError' })).toBe(false);
  });
});
