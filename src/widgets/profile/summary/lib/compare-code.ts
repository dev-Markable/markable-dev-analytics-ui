import type { AuthorActivity } from '@/entities/user';
import type { Standing } from '@/shared/ui';
import { safeDiv } from '@/shared/lib';

export interface CodeMetricComparison {
  value: number;
  /** Среднее по команде (среди авторов с коммитами в периоде). */
  teamAvg: number;
  standing: Standing;
}

export interface ProfileCodeStats {
  /** Доля тестового кода, % от добавленных строк. Больше — лучше, вердикт уместен. */
  testRatio: CodeMetricComparison;
  /**
   * Строк на не-мердж коммит — размер шага, а не объём.
   *
   * Без вердикта осознанно: «выше среднего» здесь не комплимент. Плохи оба конца —
   * и микро-коммиты, и полотна на тысячу строк (бэк в ActivityScore считает здоровым
   * коридор 10..200). Стрелка вверх на 900 строк/коммит вводила бы в заблуждение,
   * поэтому показываем только среднее по команде как точку отсчёта.
   */
  linesPerCommit: { value: number; teamAvg: number };
}

/** ±15% вокруг среднего считаем «на уровне команды» — тот же коридор, что у ревью. */
const AROUND_BAND = 0.15;

export function standingOf(value: number, avg: number): Standing {
  if (avg === 0) return value > 0 ? 'above' : 'around';
  const ratio = value / avg;
  if (ratio > 1 + AROUND_BAND) return 'above';
  if (ratio < 1 - AROUND_BAND) return 'below';
  return 'around';
}

const nonMerge = (a: AuthorActivity): number => a.commits - a.mergeCommits;

/**
 * Сравнивает метрики кода автора со средним по команде.
 *
 * Baseline считается по авторам с коммитами в периоде — те, кто не коммитил,
 * занижают планку и делают героем любого работавшего (та же логика, что для ревью).
 *
 * Среднее берётся от **отношений**, а не отношение сумм: команда из десяти человек
 * не должна прятать одного, кто пишет тесты, за одним, кто залил огромный
 * сгенерированный файл.
 *
 * Возвращает null, если автора нет в выборке или команда пуста — тогда плитки
 * показываются без бейджей, а не с выдуманным сравнением.
 */
export function buildProfileCodeStats(
  authors: readonly AuthorActivity[] | undefined,
  email: string,
): ProfileCodeStats | null {
  if (!authors || authors.length === 0) return null;

  const me = authors.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!me) return null;

  const active = authors.filter((a) => nonMerge(a) > 0 && a.addedLines > 0);
  if (active.length === 0) return null;

  const avgOf = (pick: (a: AuthorActivity) => number): number =>
    active.reduce((sum, a) => sum + pick(a), 0) / active.length;

  const testRatioOf = (a: AuthorActivity) => safeDiv(a.testAddedLines, a.addedLines) * 100;
  const linesPerCommitOf = (a: AuthorActivity) => safeDiv(a.addedLines, nonMerge(a));

  const myTestRatio = testRatioOf(me);
  const myLinesPerCommit = linesPerCommitOf(me);
  const avgTestRatio = avgOf(testRatioOf);
  const avgLinesPerCommit = avgOf(linesPerCommitOf);

  return {
    testRatio: {
      value: myTestRatio,
      teamAvg: avgTestRatio,
      standing: standingOf(myTestRatio, avgTestRatio),
    },
    linesPerCommit: { value: myLinesPerCommit, teamAvg: avgLinesPerCommit },
  };
}
