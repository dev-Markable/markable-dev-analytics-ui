import { describe, expect, it } from 'vitest';
import { createRaceGuard } from './race';

describe('createRaceGuard', () => {
  it('первый id всегда current', () => {
    const guard = createRaceGuard();
    const id = guard.next();
    expect(guard.isCurrent(id)).toBe(true);
  });

  it('предыдущий id перестаёт быть current после next()', () => {
    const guard = createRaceGuard();
    const first = guard.next();
    const second = guard.next();
    expect(guard.isCurrent(first)).toBe(false);
    expect(guard.isCurrent(second)).toBe(true);
  });

  it('два независимых guard\'а не пересекаются', () => {
    const a = createRaceGuard();
    const b = createRaceGuard();
    const idA = a.next();
    b.next();
    b.next();
    // У каждого свой счётчик; idA = 1, у b уже 2 → isCurrent(idA)=false,
    // но в первом guard'е idA всё ещё current.
    expect(a.isCurrent(idA)).toBe(true);
    expect(b.isCurrent(idA)).toBe(false);
  });

  it('классический сценарий race: первый запрос завершился вторым по времени', () => {
    const guard = createRaceGuard();
    const slow = guard.next(); // юзер сменил фильтр
    const fast = guard.next(); // новый запрос стартовал
    // fast вернулся первым — current.
    expect(guard.isCurrent(fast)).toBe(true);
    // slow возвращается позже — НЕ current, в стор писать нельзя.
    expect(guard.isCurrent(slow)).toBe(false);
  });
});
