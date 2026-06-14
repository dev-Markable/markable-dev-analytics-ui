import { describe, expect, it } from 'vitest';
import { matchCommands, type Command } from './match';

const cmd = (over: Partial<Command>): Command => ({
  id: 'x',
  group: 'Навигация',
  label: 'Дашборд',
  run: () => {},
  ...over,
});

const list: Command[] = [
  cmd({ id: 'dash', label: 'Дашборд' }),
  cmd({ id: 'act', label: 'Активность' }),
  cmd({ id: 'boris', group: 'Разработчики', label: 'Boris', hint: 'boris@x5.ru', keywords: 'Маркировка' }),
];

describe('matchCommands', () => {
  it('пустой запрос → все команды (копия)', () => {
    const res = matchCommands(list, '   ');
    expect(res).toHaveLength(3);
    expect(res).not.toBe(list);
  });

  it('регистронезависимый поиск по label', () => {
    expect(matchCommands(list, 'дашборд').map((c) => c.id)).toEqual(['dash']);
  });

  it('находит по hint (email)', () => {
    expect(matchCommands(list, 'boris@').map((c) => c.id)).toEqual(['boris']);
  });

  it('находит по скрытым keywords', () => {
    expect(matchCommands(list, 'маркировка').map((c) => c.id)).toEqual(['boris']);
  });

  it('несколько токенов — AND', () => {
    expect(matchCommands(list, 'boris x5').map((c) => c.id)).toEqual(['boris']);
    expect(matchCommands(list, 'boris дашборд')).toHaveLength(0);
  });

  it('нет совпадений → пусто', () => {
    expect(matchCommands(list, 'zzz')).toEqual([]);
  });
});
