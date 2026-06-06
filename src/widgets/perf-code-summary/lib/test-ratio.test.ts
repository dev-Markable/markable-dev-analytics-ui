import { describe, expect, it } from 'vitest';
import { testRatio } from './test-ratio';

describe('testRatio', () => {
  it('addedLines = 0 → null', () => {
    expect(testRatio(0, 0)).toBeNull();
    expect(testRatio(10, 0)).toBeNull();
  });

  it('addedLines < 0 → null (defensive)', () => {
    expect(testRatio(5, -3)).toBeNull();
  });

  it('обычное соотношение округляется', () => {
    expect(testRatio(20, 100)).toBe(20);
    expect(testRatio(33, 100)).toBe(33);
    expect(testRatio(1, 3)).toBe(33);
  });

  it('тестов больше добавленных строк → возможен >100% (тесты — подмножество, но математика честная)', () => {
    expect(testRatio(150, 100)).toBe(150);
  });
});
