import type { AuthorActivity } from '@/entities/user';
import type { DailyStat, ReviewAuthor } from '@/entities/stats';

export interface HealthIndicator {
  key: string;
  label: string;
  /** Готовое к показу значение (уже отформатировано). */
  value: string;
  hint: string;
  /** Оценка «здоровья»: хорошо / внимание / плохо. Управляет цветом точки. */
  tone: 'good' | 'warn' | 'bad';
}

/** Порог «здорового» значения по каждому индикатору — в одном месте, чтобы не разъезжались. */
const THRESHOLDS = {
  testRatio: { good: 15, warn: 5 },
  reviewCoverage: { good: 60, warn: 30 },
  busFactor: { good: 3, warn: 2 },
} as const;

const tone = (value: number, good: number, warn: number): HealthIndicator['tone'] =>
  value >= good ? 'good' : value >= warn ? 'warn' : 'bad';

/**
 * Сводка «здоровья» команды за период — четыре индикатора в одну строку.
 *
 * Считается из уже загруженных данных дашборда, без новых запросов: доля тестового кода
 * и концентрация авторов — из daily, покрытие ревью — из ревью-метрик.
 */
export function computeHealth(
  items: readonly AuthorActivity[],
  daily: readonly DailyStat[],
  reviews: readonly ReviewAuthor[],
): HealthIndicator[] {
  const addedLines = daily.reduce((sum, d) => sum + d.addedLines, 0);
  const testLines = daily.reduce((sum, d) => sum + d.testAddedLines, 0);
  const testRatio = addedLines > 0 ? (testLines / addedLines) * 100 : 0;

  // Bus factor: сколько авторов дают половину всех коммитов. Чем больше — тем устойчивее.
  const commits = [...items].map((a) => a.commits).sort((a, b) => b - a);
  const totalCommits = commits.reduce((s, c) => s + c, 0);
  let acc = 0;
  let busFactor = 0;
  for (const c of commits) {
    if (acc >= totalCommits / 2) break;
    acc += c;
    busFactor += 1;
  }

  // Покрытие ревью: доля разработчиков периода, которые хоть раз ревьюили чужой MR.
  const reviewers = reviews.filter((r) => r.reviewsGiven > 0).length;
  const reviewCoverage = items.length > 0 ? (reviewers / items.length) * 100 : 0;

  return [
    {
      key: 'test-ratio',
      label: 'Доля тестового кода',
      value: `${testRatio.toFixed(1)}%`,
      hint: 'тестовых строк от добавленных',
      tone: tone(testRatio, THRESHOLDS.testRatio.good, THRESHOLDS.testRatio.warn),
    },
    {
      key: 'review-coverage',
      label: 'Участвуют в ревью',
      value: `${Math.round(reviewCoverage)}%`,
      hint: `${reviewers} из ${items.length} разработчиков`,
      tone: tone(reviewCoverage, THRESHOLDS.reviewCoverage.good, THRESHOLDS.reviewCoverage.warn),
    },
    {
      key: 'bus-factor',
      label: 'Bus factor',
      value: String(busFactor),
      hint: 'авторов дают половину коммитов',
      tone: tone(busFactor, THRESHOLDS.busFactor.good, THRESHOLDS.busFactor.warn),
    },
    {
      key: 'contributors',
      label: 'Активных авторов',
      value: String(items.length),
      hint: 'коммитили в периоде',
      tone: items.length > 0 ? 'good' : 'bad',
    },
  ];
}
