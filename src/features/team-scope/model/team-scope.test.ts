import { describe, expect, it } from 'vitest';
import { ALL_TEAMS, NO_TEAM, filterByScope, matchesScope } from './team-scope.store';

interface Author {
  email: string;
  team: string | null;
}

const authors: Author[] = [
  { email: 'a@x5.ru', team: 'Маркировка' },
  { email: 'b@x5.ru', team: 'Платформа' },
  { email: 'c@x5.ru', team: null },
];

describe('matchesScope', () => {
  describe('ALL_TEAMS', () => {
    it('пропускает любого автора, включая без команды', () => {
      expect(matchesScope('Маркировка', ALL_TEAMS)).toBe(true);
      expect(matchesScope(null, ALL_TEAMS)).toBe(true);
      expect(matchesScope(undefined, ALL_TEAMS)).toBe(true);
    });
  });

  describe('NO_TEAM', () => {
    it('пропускает только авторов без команды', () => {
      expect(matchesScope(null, NO_TEAM)).toBe(true);
      expect(matchesScope(undefined, NO_TEAM)).toBe(true);
      expect(matchesScope('', NO_TEAM)).toBe(true);
    });

    it('фильтрует авторов с командой', () => {
      expect(matchesScope('Маркировка', NO_TEAM)).toBe(false);
      expect(matchesScope('Платформа', NO_TEAM)).toBe(false);
    });
  });

  describe('конкретное имя команды', () => {
    it('пропускает только точное совпадение', () => {
      expect(matchesScope('Маркировка', 'Маркировка')).toBe(true);
      expect(matchesScope('Платформа', 'Маркировка')).toBe(false);
      expect(matchesScope(null, 'Маркировка')).toBe(false);
    });

    it('case-sensitive (имена команд — свободный текст с бэка)', () => {
      expect(matchesScope('маркировка', 'Маркировка')).toBe(false);
    });

    it('не интерпретирует пустую строку как «без команды»', () => {
      // ALL_TEAMS / NO_TEAM — только спец-значения; пустую строку трактуем как
      // отсутствие команды для команды-фильтра — false (не совпадает).
      expect(matchesScope('', 'Маркировка')).toBe(false);
    });
  });
});

describe('filterByScope', () => {
  const getTeam = (a: Author) => a.team;

  it('ALL_TEAMS возвращает исходный массив (тот же ref)', () => {
    expect(filterByScope(authors, ALL_TEAMS, getTeam)).toBe(authors);
  });

  it('null/undefined → пустой массив', () => {
    expect(filterByScope(null, 'Маркировка', getTeam)).toEqual([]);
    expect(filterByScope(undefined, 'Маркировка', getTeam)).toEqual([]);
  });

  it('конкретная команда оставляет только точные совпадения', () => {
    const r = filterByScope(authors, 'Маркировка', getTeam);
    expect(r.map((a) => a.email)).toEqual(['a@x5.ru']);
  });

  it('NO_TEAM оставляет только авторов без команды', () => {
    const r = filterByScope(authors, NO_TEAM, getTeam);
    expect(r.map((a) => a.email)).toEqual(['c@x5.ru']);
  });

  it('alwaysKeep пропускает элемент независимо от скопа', () => {
    // Субъект профиля b@x5.ru — не из Маркировки, но должен остаться.
    const r = filterByScope(
      authors,
      'Маркировка',
      getTeam,
      (a) => a.email === 'b@x5.ru',
    );
    expect(r.map((a) => a.email).sort()).toEqual(['a@x5.ru', 'b@x5.ru']);
  });

  it('alwaysKeep не возвращает дубль для уже подходящих элементов', () => {
    // a@x5.ru проходит и по скопу, и по alwaysKeep — не должно быть в выборке дважды.
    const r = filterByScope(authors, 'Маркировка', getTeam, (a) => a.email === 'a@x5.ru');
    expect(r.map((a) => a.email)).toEqual(['a@x5.ru']);
  });
});
