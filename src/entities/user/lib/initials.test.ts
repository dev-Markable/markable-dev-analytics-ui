import { describe, expect, it } from 'vitest';
import { authorAsUser, userDisplayName, userInitials } from './initials';
import { makeAuthor } from '@/shared/test/factories';

describe('userInitials', () => {
  it('два слова из name → первые буквы', () => {
    expect(userInitials({ name: 'Boris Osechinskiy', username: null, email: 'b@x5.ru' })).toBe('BO');
  });

  it('одно слово в name → первая буква + ?', () => {
    expect(userInitials({ name: 'Boris', username: null, email: 'b@x5.ru' })).toBe('B');
  });

  it('email-фоллбэк: разбивает по `.`, `_`, `-`', () => {
    expect(userInitials({ name: null, username: null, email: 'boris.osechinskiy@x5.ru' })).toBe(
      'BO',
    );
    expect(userInitials({ name: null, username: null, email: 'kiril_dev@x5.ru' })).toBe('KD');
  });

  it('односложный local-part в email → первая буква (initials возвращает только first)', () => {
    expect(userInitials({ name: null, username: null, email: 'boris@x5.ru' })).toBe('B');
  });

  it('username использует, если есть и нет name', () => {
    expect(userInitials({ name: null, username: 'boris', email: 'b@x5.ru' })).toBe('B');
  });

  it('пустой инпут → ?', () => {
    expect(userInitials({ name: null, username: null, email: '' })).toBe('?');
  });
});

describe('userDisplayName', () => {
  it('предпочитает name', () => {
    expect(userDisplayName({ name: 'Boris', username: 'boris', email: 'b@x5.ru' })).toBe('Boris');
  });

  it('фоллбэк на username', () => {
    expect(userDisplayName({ name: null, username: 'boris', email: 'b@x5.ru' })).toBe('boris');
  });

  it('последний фоллбэк — email', () => {
    expect(userDisplayName({ name: null, username: null, email: 'b@x5.ru' })).toBe('b@x5.ru');
  });
});

describe('authorAsUser', () => {
  it('переносит displayName и avatarUrl, заполняет username=null', () => {
    const author = makeAuthor({
      email: 'a@x5.ru',
      displayName: 'Alice',
      avatarUrl: 'https://x/a.png',
    });
    expect(authorAsUser(author)).toEqual({
      email: 'a@x5.ru',
      name: 'Alice',
      username: null,
      avatarUrl: 'https://x/a.png',
    });
  });

  it('сохраняет null в displayName / avatarUrl', () => {
    const author = makeAuthor({ email: 'a@x5.ru', displayName: null, avatarUrl: null });
    expect(authorAsUser(author)).toEqual({
      email: 'a@x5.ru',
      name: null,
      username: null,
      avatarUrl: null,
    });
  });
});
