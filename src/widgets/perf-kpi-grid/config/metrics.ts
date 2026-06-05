import type { MetricKey } from '@/entities/performance-review';

export interface MetricSpec {
  key: MetricKey;
  label: string;
  group: 'code' | 'review' | 'tasks';
  /** Снапшот «как сейчас» — дельты нет, скрываем. */
  snapshot?: boolean;
  /** Для метрик-времени — формат «N ч / N дн» вместо числа. */
  hours?: boolean;
  /** true → меньше = лучше (время до merge): инвертируем тон дельты. */
  lowerIsBetter?: boolean;
}

/**
 * Порядок и подписи KPI-карточек. Снапшот-метрики (*InWork/Closed по задачам)
 * помечены — у них previous/delta = null, дельту не рисуем.
 */
export const METRIC_SPECS: readonly MetricSpec[] = [
  { key: 'commits', label: 'Коммиты', group: 'code' },
  { key: 'nonMergeCommits', label: 'Не-мердж коммиты', group: 'code' },
  { key: 'addedLines', label: 'Добавлено строк', group: 'code' },
  { key: 'deletedLines', label: 'Удалено строк', group: 'code' },
  { key: 'testAddedLines', label: 'Строк тест-кода', group: 'code' },

  { key: 'reviewsGiven', label: 'Ревью (approve)', group: 'review' },
  { key: 'commentsGiven', label: 'Ревью-комментарии', group: 'review' },
  { key: 'reviewsReceived', label: 'Получено ревью', group: 'review' },
  { key: 'mergedMrCount', label: 'Смержено MR', group: 'review' },
  { key: 'avgTimeToMergeHours', label: 'Ср. время до merge', group: 'review', hours: true, lowerIsBetter: true },

  { key: 'defectsInWork', label: 'Дефекты в работе', group: 'tasks', snapshot: true },
  { key: 'defectsClosed', label: 'Дефекты закрыты', group: 'tasks' },
  { key: 'devTasksInWork', label: 'Задачи в работе', group: 'tasks', snapshot: true },
  { key: 'devTasksClosed', label: 'Задачи закрыты', group: 'tasks' },
];

export const GROUP_LABEL: Record<MetricSpec['group'], string> = {
  code: 'Код',
  review: 'Ревью',
  tasks: 'Задачи (по текущему состоянию карточек)',
};
