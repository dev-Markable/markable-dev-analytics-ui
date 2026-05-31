import { describe, expect, it } from 'vitest';
import { extractCardId, stripTaskPrefix } from './task-id';
import { makeCommit } from '@/shared/test/factories';

describe('extractCardId', () => {
  it('берёт часть после дефиса в формате <space>-<task>', () => {
    const c = makeCommit({ message: '1700-3263985 fix the bug', taskNumber: '1700' });
    expect(extractCardId(c)).toBe('3263985');
  });

  it('ловит space-task внутри merge-сообщения', () => {
    const c = makeCommit({
      message: "Merge branch 'feature/1700-3263985_uc5' into 'master'",
      taskNumber: null,
    });
    expect(extractCardId(c)).toBe('3263985');
  });

  it('фоллбэк на taskNumber, если дефис-формата нет', () => {
    const c = makeCommit({ message: 'just a message', taskNumber: '42' });
    expect(extractCardId(c)).toBe('42');
  });

  it('возвращает null, если ни паттерна, ни taskNumber', () => {
    const c = makeCommit({ message: 'initial commit', taskNumber: null });
    expect(extractCardId(c)).toBeNull();
  });

  it('нормализует undefined taskNumber к null', () => {
    const c = makeCommit({ message: 'no task here', taskNumber: undefined });
    expect(extractCardId(c)).toBeNull();
  });

  it('первое вхождение паттерна выигрывает', () => {
    const c = makeCommit({ message: '10-200 и ещё 30-400', taskNumber: null });
    expect(extractCardId(c)).toBe('200');
  });
});

describe('stripTaskPrefix', () => {
  it('убирает префикс <space>-<task>', () => {
    expect(stripTaskPrefix('1700-3263985 fix the bug')).toBe('fix the bug');
  });

  it('убирает простой числовой префикс', () => {
    expect(stripTaskPrefix('12345 fix the bug')).toBe('fix the bug');
  });

  it('не трогает сообщение без префикса', () => {
    expect(stripTaskPrefix('fix the bug')).toBe('fix the bug');
  });

  it('обрезает разделители после префикса', () => {
    expect(stripTaskPrefix('1700-3263985: добавил тест')).toBe('добавил тест');
  });

  it('тримит ведущие пробелы', () => {
    expect(stripTaskPrefix('   hello')).toBe('hello');
  });
});
