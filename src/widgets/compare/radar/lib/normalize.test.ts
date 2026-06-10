import { describe, expect, it } from 'vitest';
import { axisValue, buildRadarData } from './normalize';
import { makeAuthor, makeActivity } from '@/shared/test/factories';

describe('axisValue', () => {
  it('достаёт score из activity', () => {
    const a = makeAuthor({ activity: makeActivity({ score: 1.4 }) });
    expect(axisValue(a, 'score')).toBe(1.4);
  });
  it('score = 0 если activity нет', () => {
    expect(axisValue(makeAuthor({ activity: null }), 'score')).toBe(0);
  });
  it('достаёт обычные метрики', () => {
    const a = makeAuthor({ addedLines: 500 });
    expect(axisValue(a, 'addedLines')).toBe(500);
  });
});

describe('buildRadarData', () => {
  it('нормализует к максимуму по каждой оси', () => {
    const authors = [
      makeAuthor({ email: 'a@x5.ru', commits: 100, mergeCommits: 0, addedLines: 1000 }),
      makeAuthor({ email: 'b@x5.ru', commits: 50, mergeCommits: 0, addedLines: 250 }),
    ];
    const data = buildRadarData(authors);
    const commitsAxis = data.find((d) => d.axis === 'Коммиты')!;
    expect(commitsAxis['a@x5.ru']).toBe(1); // лидер
    expect(commitsAxis['b@x5.ru']).toBe(0.5); // 50/100

    const addedAxis = data.find((d) => d.axis === 'Добавлено')!;
    expect(addedAxis['a@x5.ru']).toBe(1);
    expect(addedAxis['b@x5.ru']).toBe(0.25); // 250/1000
  });

  it('все нули по оси → 0 без деления на ноль', () => {
    const authors = [
      makeAuthor({ email: 'a@x5.ru', testAddedLines: 0 }),
      makeAuthor({ email: 'b@x5.ru', testAddedLines: 0 }),
    ];
    const testAxis = buildRadarData(authors).find((d) => d.axis === 'Тесты')!;
    expect(testAxis['a@x5.ru']).toBe(0);
    expect(testAxis['b@x5.ru']).toBe(0);
  });

  it('5 осей', () => {
    expect(buildRadarData([makeAuthor()])).toHaveLength(5);
  });
});
