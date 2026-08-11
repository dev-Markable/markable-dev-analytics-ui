import type { UserProfile } from '@/entities/user';
import type { KaitenCardType } from '@/entities/kaiten-card';
import { safeDiv } from '@/shared/lib';
import { groupCommitsByTask, ORPHAN_KEY, type TaskGroup } from '@/widgets/profile/tasks-timeline';

/** Типы карточек в порядке отображения сегментов и легенды. */
export const TYPE_ORDER: readonly KaitenCardType[] = [
  'DEVELOPMENT',
  'DEFECT',
  'TASK',
  'OTHER',
];

export interface TypeSlice {
  type: KaitenCardType;
  tasks: number;
  commits: number;
}

export interface CompareTaskColumn {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  team: string | null;
  isLead: boolean;
  /** Задачи с коммитами в периоде, по убыванию коммитов. */
  tasks: TaskGroup[];
  /** Сколько задач всего — колонка показывает только верхушку. */
  totalTasks: number;
  /** Коммиты по всем задачам с номером. */
  totalCommits: number;
  /** Средний размер задачи в коммитах — одна крупная или десять мелких. */
  commitsPerTask: number;
  /** Разбивка по типу карточки — для сегментированной полосы. */
  byType: TypeSlice[];
  /** Задач, доведённых до DONE. */
  doneTasks: number;
  /** Коммиты без номера задачи в сообщении. */
  orphanCommits: number;
}

/** Сколько задач показываем в колонке. Остальное — счётчиком снизу. */
export const TASKS_PER_COLUMN = 6;

/**
 * Профили выбранных разработчиков → колонки для side-by-side сравнения.
 *
 * Карточки без коммитов в периоде отбрасываем: в профиле они уместны (там видно
 * весь назначенный бэклог), но в сравнении дают колонки из нулей и прячут то,
 * ради чего страницу открывают — над чем человек реально работал.
 *
 * Orphan-группа тоже не задача, поэтому уходит из списка в отдельный счётчик.
 *
 * Кроме списка колонка несёт агрегаты: без них блок был двумя независимыми
 * перечнями, из которых не читалось ни соотношение объёмов, ни состав работы —
 * одна крупная фича и четыре мелких бага выглядели одинаково.
 */
export function buildTaskColumns(profiles: readonly UserProfile[]): CompareTaskColumn[] {
  return profiles.map((profile) => {
    const groups = groupCommitsByTask(profile.commits, profile.cards);
    const orphan = groups.find((g) => g.key === ORPHAN_KEY);
    const worked = groups
      .filter((g) => g.key !== ORPHAN_KEY && g.totalCommits > 0)
      .sort((a, b) => b.totalCommits - a.totalCommits);

    const totalCommits = worked.reduce((sum, g) => sum + g.totalCommits, 0);

    const byType = TYPE_ORDER.map<TypeSlice>((type) => {
      // Группа без карточки (задача упомянута, но не найдена в Kaiten) типа не имеет —
      // считаем её OTHER, иначе её коммиты выпадут из полосы и та не сойдётся с итогом.
      const slice = worked.filter((g) => (g.card?.cardType ?? 'OTHER') === type);
      return {
        type,
        tasks: slice.length,
        commits: slice.reduce((sum, g) => sum + g.totalCommits, 0),
      };
    }).filter((s) => s.tasks > 0);

    return {
      email: profile.user.email,
      displayName: profile.user.name ?? null,
      avatarUrl: profile.user.avatarUrl ?? null,
      team: profile.user.team ?? null,
      isLead: profile.user.isLead ?? false,
      tasks: worked.slice(0, TASKS_PER_COLUMN),
      totalTasks: worked.length,
      totalCommits,
      commitsPerTask: safeDiv(totalCommits, worked.length),
      byType,
      doneTasks: worked.filter((g) => g.card?.columnStatus === 'DONE').length,
      orphanCommits: orphan?.totalCommits ?? 0,
    };
  });
}

/**
 * Максимум коммитов на задачу среди ВСЕХ колонок — общая шкала для полос.
 *
 * Если нормировать каждую колонку по себе, у всех верхняя задача окажется во всю
 * ширину, и одна задача на 35 коммитов будет выглядеть как задача на три. Общая
 * шкала — единственное, что делает списки сопоставимыми.
 */
export function maxTaskCommits(columns: readonly CompareTaskColumn[]): number {
  return Math.max(1, ...columns.flatMap((c) => c.tasks.map((t) => t.totalCommits)));
}
