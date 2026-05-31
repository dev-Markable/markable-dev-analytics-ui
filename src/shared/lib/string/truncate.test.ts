import { describe, expect, it } from 'vitest';
import { truncate, initials } from './truncate';

describe('truncate', () => {
  it('не трогает короткую строку', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
  it('строку точной длины не трогает', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
  it('режет и добавляет эллипсис', () => {
    expect(truncate('hello world', 5)).toBe('hell…');
  });
});

describe('initials', () => {
  it('две части → первая+последняя заглавные', () => {
    expect(initials('boris osechinskiy')).toBe('BO');
  });
  it('одна часть → одна буква', () => {
    expect(initials('boris')).toBe('B');
  });
  it('лишние пробелы схлопываются', () => {
    expect(initials('  boris   osechinskiy  ')).toBe('BO');
  });
});
