import type { DefectsByPeriodResponse } from '@/entities/stats';

/** Попадает ли дата создания дефекта (ISO datetime) в период [from, to] (ISO date, включительно). */
export const inPeriod = (createdAt: string, from: string, to: string): boolean => {
  const day = createdAt.slice(0, 10);
  return day >= from && day <= to;
};

/**
 * Оптимистичное локальное применение AI-флага: выставляет `aiAgent=true` отмеченным дефектам
 * и поднимает `aiAgentCount` у периодов, в которые они попадают (по `createdAt`). Держит пирог,
 * таблицу результата и детальную таблицу согласованными без перезапроса Kaiten (дорогого).
 *
 * Идемпотентно: дефекты, уже помеченные `aiAgent`, не пересчитываются повторно (без двойного bump).
 */
export function applyAiAgentLocally(
  resp: DefectsByPeriodResponse,
  markedIds: readonly number[],
): DefectsByPeriodResponse {
  const marked = new Set(markedIds);
  const flipped = resp.defects.filter((d) => marked.has(d.id) && !d.aiAgent);
  if (flipped.length === 0) return resp;
  return {
    ...resp,
    defects: resp.defects.map((d) => (marked.has(d.id) && !d.aiAgent ? { ...d, aiAgent: true } : d)),
    periods: resp.periods.map((p) => {
      const add = flipped.filter((d) => inPeriod(d.createdAt, p.from, p.to)).length;
      return add ? { ...p, aiAgentCount: p.aiAgentCount + add } : p;
    }),
  };
}
