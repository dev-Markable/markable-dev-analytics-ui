import { describe, expect, it } from 'vitest';
import { ALL_TEAMS, NO_TEAM, matchesScope } from './team-scope.store';

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
