import { useCallback } from 'react';
import { userDisplayName, type AuthorActivity } from '@/entities/user';
import { downloadCsv, type CsvColumn, type DateRange } from '@/shared/lib';

const csvColumns: CsvColumn<AuthorActivity>[] = [
  {
    header: 'Автор',
    value: (a) => userDisplayName({ name: a.displayName ?? null, username: null, email: a.email }),
  },
  { header: 'Email', value: (a) => a.email },
  { header: 'Категория', value: (a) => a.activity?.category ?? '' },
  { header: 'Score', value: (a) => a.activity?.score ?? '' },
  { header: 'Коммиты', value: (a) => a.commits },
  { header: 'Не-мердж', value: (a) => a.nonMergeCommits },
  { header: 'Merge', value: (a) => a.mergeCommits },
  { header: 'Добавлено', value: (a) => a.addedLines },
  { header: 'Удалено', value: (a) => a.deletedLines },
  { header: 'Тесты', value: (a) => a.testAddedLines },
];

/**
 * Экспорт списка авторов в CSV. Отдельно от компонента: кнопку рисует родитель
 * в шапке раскрывающегося блока — своей шапки у таблицы больше нет.
 */
export function useAuthorsCsvExport(items: readonly AuthorActivity[], range: DateRange) {
  return useCallback(() => {
    downloadCsv(`devpulse-авторы_${range.from}_${range.to}.csv`, items, csvColumns);
  }, [items, range.from, range.to]);
}
