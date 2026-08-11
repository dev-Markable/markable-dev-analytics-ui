import type { ReviewAuthor, ReviewStats } from '@/entities/stats';
import type { Standing } from '@/shared/ui';

export interface ReviewMetricComparison {
  value: number;
  /** Среднее по команде (среди активных ревьюеров). */
  teamAvg: number;
  /** Позиция относительно среднего. */
  standing: Standing;
}

export interface ProfileReviewStats {
  author: ReviewAuthor;
  reviewsGiven: ReviewMetricComparison;
  commentsGiven: ReviewMetricComparison;
  reviewsReceived: ReviewMetricComparison;
  /** Ранг по вовлечённости (approve+comments), 1-based, среди активных. */
  engagementRank: number;
  /** Сколько всего активных ревьюеров (знаменатель ранга). */
  activeReviewers: number;
}

const engagement = (a: ReviewAuthor): number => a.reviewsGiven + a.commentsGiven;

/** ±15% вокруг среднего считаем «на уровне команды». */
const AROUND_BAND = 0.15;

function standingOf(value: number, avg: number): Standing {
  if (avg === 0) return value > 0 ? 'above' : 'around';
  const ratio = value / avg;
  if (ratio > 1 + AROUND_BAND) return 'above';
  if (ratio < 1 - AROUND_BAND) return 'below';
  return 'around';
}

/**
 * Извлекает ревью-метрики одного автора из командного ReviewStats
 * и сравнивает их со средним по команде.
 *
 * Baseline (среднее) считается по **активным** ревьюерам (вовлечённость > 0) —
 * иначе «спящие» аккаунты занижают планку и все выглядят героями.
 * Возвращает null, если автора нет в выборке.
 */
export function buildProfileReviewStats(
  stats: ReviewStats | null,
  email: string,
): ProfileReviewStats | null {
  if (!stats) return null;
  const author = stats.authors.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!author) return null;

  const active = stats.authors.filter((a) => engagement(a) > 0);
  const denom = active.length || 1;
  const avg = (pick: (a: ReviewAuthor) => number): number =>
    active.reduce((s, a) => s + pick(a), 0) / denom;

  const avgGiven = avg((a) => a.reviewsGiven);
  const avgComments = avg((a) => a.commentsGiven);
  const avgReceived = avg((a) => a.reviewsReceived);

  // Ранг по вовлечённости среди активных (1 = самый вовлечённый).
  const sorted = [...active].sort((a, b) => engagement(b) - engagement(a));
  const idx = sorted.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
  const engagementRank = idx >= 0 ? idx + 1 : active.length + 1;

  return {
    author,
    reviewsGiven: {
      value: author.reviewsGiven,
      teamAvg: avgGiven,
      standing: standingOf(author.reviewsGiven, avgGiven),
    },
    commentsGiven: {
      value: author.commentsGiven,
      teamAvg: avgComments,
      standing: standingOf(author.commentsGiven, avgComments),
    },
    reviewsReceived: {
      value: author.reviewsReceived,
      teamAvg: avgReceived,
      standing: standingOf(author.reviewsReceived, avgReceived),
    },
    engagementRank,
    activeReviewers: active.length,
  };
}
