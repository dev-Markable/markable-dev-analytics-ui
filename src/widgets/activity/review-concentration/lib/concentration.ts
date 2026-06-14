import type { ReviewAuthor } from '@/entities/stats';

export type RiskLevel = 'high' | 'medium' | 'low';

/**
 * Точка кривой Лоренца: какая доля ревьюеров (`x`) даёт какую долю approve (`y`).
 * Идеальное равенство — диагональ y = x; чем сильнее провисает вниз, тем больше
 * approve стянуто на немногих.
 */
export interface LorenzPoint {
  x: number;
  y: number;
}

/**
 * Концентрация ревью по команде — ревью-аналог bus factor для кода.
 * Все метрики считаются по `reviewsGiven` (approve чужим MR) — это «акт
 * пропуска» кода. Полученные ревью (`reviewsReceived`) сюда НЕ входят: они
 * ограничены личным числом MR и несравнимы с выданными (другая ось).
 */
export interface ConcentrationStats {
  /** Ревьюеров с ненулевым approve. */
  activeReviewers: number;
  /** Сумма approve по команде. */
  totalApprove: number;
  /** Минимум ревьюеров, чьи approve в сумме дают > 50% (review bus factor). */
  busFactor: number;
  /** Доля approve у топ-ревьюера [0..1]. */
  topShareValue: number;
  /** Доля approve у топ-3 [0..1]. */
  top3Share: number;
  /** Неравенство Джини [0..1]. */
  gini: number;
  riskLevel: RiskLevel;
  /** Точки кривой Лоренца от (0,0) до (1,1). */
  lorenz: LorenzPoint[];
}

const riskOf = (busFactor: number): RiskLevel =>
  busFactor <= 1 ? 'high' : busFactor === 2 ? 'medium' : 'low';

/**
 * Коэффициент Джини для неотрицательных значений (отсортированная формула).
 * 0 — равенство, →1 — всё на одном. Пусто / нулевая сумма → 0.
 */
export function giniCoefficient(values: readonly number[]): number {
  const xs = values.filter((v) => v > 0).sort((a, b) => a - b);
  const n = xs.length;
  if (n === 0) return 0;
  const total = xs.reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  let weighted = 0;
  for (let i = 0; i < n; i++) weighted += (i + 1) * xs[i]!;
  const g = (2 * weighted) / (n * total) - (n + 1) / n;
  return Math.max(0, Math.min(1, g));
}

/** Доля суммы топ-`n` значений в общей сумме [0..1]. */
export function topShare(values: readonly number[], n: number): number {
  const total = values.reduce((s, v) => s + Math.max(0, v), 0);
  if (total === 0) return 0;
  const top = [...values].sort((a, b) => b - a).slice(0, n).reduce((s, v) => s + Math.max(0, v), 0);
  return top / total;
}

/**
 * Review bus factor: сколько топ-ревьюеров нужно, чтобы накрыть > 50% всех
 * approve. 1 = ревью держится на одном человеке (риск), ≥3 = распределено.
 */
export function reviewBusFactor(values: readonly number[]): number {
  const xs = values.filter((v) => v > 0).sort((a, b) => b - a);
  const total = xs.reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  let cumulative = 0;
  let count = 0;
  for (const v of xs) {
    cumulative += v;
    count += 1;
    if (cumulative / total > 0.5) break;
  }
  return count;
}

/**
 * Кривая Лоренца: ревьюеры по возрастанию вклада, накопленная доля approve.
 * Возвращает точки с ведущим (0,0). Пустой ряд → [{0,0}].
 */
export function lorenzCurve(values: readonly number[]): LorenzPoint[] {
  const xs = values.filter((v) => v > 0).sort((a, b) => a - b);
  const n = xs.length;
  const total = xs.reduce((s, v) => s + v, 0);
  const points: LorenzPoint[] = [{ x: 0, y: 0 }];
  if (n === 0 || total === 0) return points;
  let cumulative = 0;
  for (let i = 0; i < n; i++) {
    cumulative += xs[i]!;
    points.push({ x: (i + 1) / n, y: cumulative / total });
  }
  return points;
}

/**
 * Считает {@link ConcentrationStats} из ревью-авторов. Учитываются только
 * активные ревьюеры (approve > 0). Возвращает null, если их нет.
 */
export function computeConcentration(authors: readonly ReviewAuthor[]): ConcentrationStats | null {
  const given = authors.map((a) => a.reviewsGiven).filter((v) => v > 0);
  if (given.length === 0) return null;

  const total = given.reduce((s, v) => s + v, 0);
  const busFactor = reviewBusFactor(given);

  return {
    activeReviewers: given.length,
    totalApprove: total,
    busFactor,
    topShareValue: topShare(given, 1),
    top3Share: topShare(given, 3),
    gini: giniCoefficient(given),
    riskLevel: riskOf(busFactor),
    lorenz: lorenzCurve(given),
  };
}
