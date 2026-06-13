import type { AuthorActivity, ActivityCategory } from '@/entities/user';
import type { ReviewAuthor } from '@/entities/stats';
import { formatNumber, formatPctDelta } from '@/shared/lib';

export type SignalSeverity = 'high' | 'medium' | 'info';
export type SignalKind =
  | 'activity-drop'
  | 'sustained-low'
  | 'unreviewed'
  | 'review-concentration';

export interface Signal {
  id: string;
  severity: SignalSeverity;
  kind: SignalKind;
  title: string;
  detail: string;
  /** email субъекта — для диплинка в профиль (у командных сигналов нет). */
  email?: string;
}

export interface BuildSignalsInput {
  current: readonly AuthorActivity[];
  previous: readonly AuthorActivity[];
  reviews: readonly ReviewAuthor[];
}

// Пороги вынесены, чтобы их было видно и легко крутить.
const DROP_FLOOR = 0.5; // прошлый score ниже — падение незначимо (шум малых чисел)
const DROP_MEDIUM = -0.4; // −40%
const DROP_HIGH = -0.6; // −60%
const CONCENTRATION_SHARE = 0.5; // топ-ревьюер даёт > половины approve
const CONCENTRATION_MIN_REVIEWERS = 3;
const PER_KIND_LIMIT = 5; // не затапливаем ленту однотипными

const nameOf = (a: { displayName?: string | null; email: string }): string =>
  a.displayName?.trim() || a.email;

/** Категории «ниже нормы» — для сигнала устойчиво низкой активности. */
type LowCategory = 'INACTIVE' | 'BELOW_AVERAGE';
const LOW_LABEL: Record<LowCategory, string> = {
  INACTIVE: 'неактивен',
  BELOW_AVERAGE: 'ниже среднего',
};
const isLow = (c: ActivityCategory | undefined): c is LowCategory =>
  c === 'INACTIVE' || c === 'BELOW_AVERAGE';

const SEVERITY_RANK: Record<SignalSeverity, number> = { high: 0, medium: 1, info: 2 };

/** Резкое падение activity score относительно прошлого периода (PoP). */
function activityDropSignals({ current, previous }: BuildSignalsInput): Signal[] {
  const prevScore = new Map<string, number>();
  for (const p of previous) {
    if (p.activity) prevScore.set(p.email.toLowerCase(), p.activity.score);
  }

  const out: { signal: Signal; drop: number }[] = [];
  for (const cur of current) {
    if (!cur.activity) continue;
    const prev = prevScore.get(cur.email.toLowerCase());
    if (prev == null || prev < DROP_FLOOR) continue;
    const drop = (cur.activity.score - prev) / prev;
    if (drop > DROP_MEDIUM) continue;
    out.push({
      drop,
      signal: {
        id: `drop:${cur.email}`,
        severity: drop <= DROP_HIGH ? 'high' : 'medium',
        kind: 'activity-drop',
        title: 'Резкое падение активности',
        detail: `${nameOf(cur)} · score ${cur.activity.score.toFixed(2)} (${formatPctDelta(drop * 100)} к пред. периоду)`,
        email: cur.email,
      },
    });
  }
  return out
    .sort((a, b) => a.drop - b.drop)
    .slice(0, PER_KIND_LIMIT)
    .map((x) => x.signal);
}

/**
 * Устойчиво низкая активность: автор «ниже среднего»/«неактивен» И в текущем,
 * И в прошлом периоде. Ловит хроников, которых activityDrop пропускает (у них
 * нет спада — они стабильно внизу). Дальше двух периодов нужна история с бэка.
 */
function sustainedLowSignals({ current, previous }: BuildSignalsInput): Signal[] {
  const prevCat = new Map<string, ActivityCategory>();
  for (const p of previous) {
    if (p.activity) prevCat.set(p.email.toLowerCase(), p.activity.category);
  }

  const out: { signal: Signal; score: number }[] = [];
  for (const cur of current) {
    const cat = cur.activity?.category;
    if (!isLow(cat)) continue;
    const prev = prevCat.get(cur.email.toLowerCase());
    if (!isLow(prev)) continue;
    const bothInactive = cat === 'INACTIVE' && prev === 'INACTIVE';
    out.push({
      score: cur.activity!.score,
      signal: {
        id: `sustained:${cur.email}`,
        severity: bothInactive ? 'high' : 'medium',
        kind: 'sustained-low',
        title: 'Низкая активность второй период подряд',
        detail: `${nameOf(cur)} · ${LOW_LABEL[cat]} (score ${cur.activity!.score.toFixed(2)})`,
        email: cur.email,
      },
    });
  }
  return out
    .sort((a, b) => a.score - b.score)
    .slice(0, PER_KIND_LIMIT)
    .map((x) => x.signal);
}

/** MR автора смёржены, но ни одного ревью не получили. */
function unreviewedSignals({ reviews }: BuildSignalsInput): Signal[] {
  return reviews
    .filter((r) => (r.mergedMrCount ?? 0) > 0 && r.reviewsReceived === 0)
    .sort((a, b) => (b.mergedMrCount ?? 0) - (a.mergedMrCount ?? 0))
    .slice(0, PER_KIND_LIMIT)
    .map<Signal>((r) => ({
      id: `unreviewed:${r.email}`,
      severity: 'medium',
      kind: 'unreviewed',
      title: 'MR без ревью',
      detail: `${nameOf(r)} · ${formatNumber(r.mergedMrCount ?? 0)} MR смёржены без approve`,
      email: r.email,
    }));
}

/** Ревью команды держится на одном человеке (концентрация approve). */
function concentrationSignals({ reviews }: BuildSignalsInput): Signal[] {
  const givers = reviews.map((r) => r.reviewsGiven).filter((v) => v > 0);
  if (givers.length < CONCENTRATION_MIN_REVIEWERS) return [];
  const total = givers.reduce((s, v) => s + v, 0);
  if (total === 0) return [];
  const top = reviews.reduce((m, r) => (r.reviewsGiven > m.reviewsGiven ? r : m), reviews[0]!);
  const share = top.reviewsGiven / total;
  if (share <= CONCENTRATION_SHARE) return [];
  return [
    {
      id: 'review-concentration',
      severity: 'high',
      kind: 'review-concentration',
      title: 'Ревью держится на одном человеке',
      detail: `${nameOf(top)} даёт ${Math.round(share * 100)}% всех approve команды`,
      email: top.email,
    },
  ];
}

/**
 * Собирает ленту «что требует внимания» из уже загруженных данных дашборда
 * (текущий + предыдущий период) и ревью. Чистая функция — без сети и React.
 * Сигналы отсортированы по серьёзности (high → medium → info).
 */
export function buildSignals(input: BuildSignalsInput): Signal[] {
  return [
    ...activityDropSignals(input),
    ...sustainedLowSignals(input),
    ...concentrationSignals(input),
    ...unreviewedSignals(input),
  ].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}
