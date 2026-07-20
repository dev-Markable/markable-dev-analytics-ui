import { describe, expect, it } from 'vitest';
import type { DefectsByPeriodResponse } from '@/entities/stats';
import { applyAiAgentLocally, inPeriod } from './apply-ai-agent';

const priorities = { critical: 0, high: 1, medium: 0, low: 1, unknown: 0 };

function fixture(): DefectsByPeriodResponse {
  return {
    team: 'Platform',
    periods: [
      { from: '2026-04-01', to: '2026-04-30', total: 2, aiAgentCount: 0, byPriority: { ...priorities } },
      // Пересекается с апрелем (15 апр — 15 мая).
      { from: '2026-04-15', to: '2026-05-15', total: 2, aiAgentCount: 0, byPriority: { ...priorities } },
    ],
    defects: [
      { id: 1, title: 'a', url: null, createdAt: '2026-04-05T10:00:00', aiAgent: false, members: [] },
      { id: 2, title: 'b', url: null, createdAt: '2026-04-20T10:00:00', aiAgent: false, members: [] },
      { id: 3, title: 'c', url: null, createdAt: '2026-05-10T10:00:00', aiAgent: true, members: [] },
    ],
  };
}

describe('inPeriod', () => {
  it('включает границы и режет по дате (без учёта времени)', () => {
    expect(inPeriod('2026-04-01T00:00:00', '2026-04-01', '2026-04-30')).toBe(true);
    expect(inPeriod('2026-04-30T23:59:59', '2026-04-01', '2026-04-30')).toBe(true);
    expect(inPeriod('2026-03-31T23:00:00', '2026-04-01', '2026-04-30')).toBe(false);
    expect(inPeriod('2026-05-01T00:00:00', '2026-04-01', '2026-04-30')).toBe(false);
  });
});

describe('applyAiAgentLocally', () => {
  it('ставит aiAgent=true отмеченному дефекту и поднимает aiAgentCount только у его периода', () => {
    const result = applyAiAgentLocally(fixture(), [1]);

    expect(result.defects.find((d) => d.id === 1)?.aiAgent).toBe(true);
    expect(result.periods[0].aiAgentCount).toBe(1); // 04-05 попал в апрель
    expect(result.periods[1].aiAgentCount).toBe(0); // но не в 15апр–15мая
  });

  it('дефект в пересекающихся периодах поднимает счётчик в каждом', () => {
    const result = applyAiAgentLocally(fixture(), [2]); // 04-20 — в обоих

    expect(result.periods[0].aiAgentCount).toBe(1);
    expect(result.periods[1].aiAgentCount).toBe(1);
  });

  it('идемпотентно: уже отмеченный дефект не пересчитывается (тот же объект)', () => {
    const input = fixture();
    const result = applyAiAgentLocally(input, [3]); // 3 уже aiAgent

    expect(result).toBe(input); // ссылочно тот же — flip не было
  });

  it('неизвестный id → без изменений (тот же объект)', () => {
    const input = fixture();
    expect(applyAiAgentLocally(input, [999])).toBe(input);
  });

  it('не мутирует вход и считает только реально перевёрнутые (3 уже true)', () => {
    const input = fixture();
    const result = applyAiAgentLocally(input, [1, 3]);

    expect(input.periods[0].aiAgentCount).toBe(0); // вход не тронут
    expect(input.defects.find((d) => d.id === 1)?.aiAgent).toBe(false);
    expect(result.periods[0].aiAgentCount).toBe(1); // только дефект 1
  });
});
