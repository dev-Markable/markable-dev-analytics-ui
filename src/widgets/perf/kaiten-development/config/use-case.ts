import type { UseCaseStatus, UseCaseType } from '@/entities/performance-review';

export const STATUS_LABEL: Record<UseCaseStatus, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  DONE: 'Готова',
  UNKNOWN: 'Не определена',
};

export const TYPE_LABEL: Record<UseCaseType, string> = {
  DEVELOPMENT: 'Разработка',
  TASK: 'Задача',
  DEFECT: 'Дефект',
  OTHER: 'Прочее',
};
