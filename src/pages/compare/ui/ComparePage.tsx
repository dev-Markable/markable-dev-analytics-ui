import { useCallback, useEffect, useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, PageSection, SectionTitle, EmptyState, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { ALL_TEAMS, useTeamScope, useTeamScopeFilter } from '@/features/team-scope';
import { dashboardQuery } from '@/entities/dashboard';
import { profileQuery } from '@/entities/user';
import { useApiError } from '@/shared/api';
import type { AuthorActivity, UserProfile } from '@/entities/user';
import { formatRange } from '@/shared/lib';
import { CompareSelector } from '@/widgets/compare/selector';
import { CompareMatrix } from '@/widgets/compare/matrix';
import { CompareTasks, buildTaskColumns } from '@/widgets/compare/tasks';

const MAX_AUTHORS = 3;
const PARAM = 'ids';

export function ComparePage() {
  useDocumentTitle('Сравнение');

  const range = useDateRange();
  const scope = useTeamScope();
  const [searchParams, setSearchParams] = useSearchParams();

  const dashboardQ = useQuery(dashboardQuery({ from: range.from, to: range.to }));
  const error = useApiError(dashboardQ.error);
  useApiErrorNotification(error, 'Не удалось загрузить данные для сравнения');

  const allItems = useMemo(() => dashboardQ.data?.items ?? [], [dashboardQ.data]);

  // Выбор ограничен текущей командой из топбара. Раньше страница брала сырой
  // список дашборда и фильтр команды на неё не действовал вовсе.
  const options = useTeamScopeFilter(allItems, (a) => a.team);

  // Выбранные email — из URL (?ids=a@x5.ru,b@x5.ru). Источник правды для шаринга.
  const selected = useMemo(() => {
    const raw = searchParams.get(PARAM);
    if (!raw) return [];
    return raw.split(',').filter(Boolean).slice(0, MAX_AUTHORS);
  }, [searchParams]);

  const setSelected = useCallback(
    (emails: string[]) => {
      const next = new URLSearchParams(searchParams);
      if (emails.length === 0) next.delete(PARAM);
      else next.set(PARAM, emails.slice(0, MAX_AUTHORS).join(','));
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Смена команды выкидывает из сравнения тех, кто в неё не входит: иначе в чипах
  // остались бы люди, которых уже нет в списке выбора, — фильтр выглядел бы
  // сломанным ровно так же, как раньше. Ждём загрузки, чтобы не стереть выбор из
  // ссылки, пока список авторов ещё пуст.
  useEffect(() => {
    if (scope === ALL_TEAMS || allItems.length === 0 || selected.length === 0) return;
    const allowed = new Set(options.map((a) => a.email));
    const kept = selected.filter((email) => allowed.has(email));
    if (kept.length !== selected.length) setSelected(kept);
  }, [scope, options, allItems, selected, setSelected]);

  // Авторы для сравнения — пересечение выбранных email и доступных в скопе.
  // Порядок — как в selected (стабильность колонок).
  const authors = useMemo<AuthorActivity[]>(() => {
    const byEmail = new Map(options.map((a) => [a.email, a]));
    return selected
      .map((email) => byEmail.get(email))
      .filter((a): a is AuthorActivity => a != null);
  }, [selected, options]);

  // Профили нужны только ради задач — их нет в агрегате дашборда. Запрос на автора,
  // ключ тот же, что у страницы профиля: переход туда попадёт в кэш.
  const profileQs = useQueries({
    queries: authors.map((a) => profileQuery(a.email, { from: range.from, to: range.to })),
  });

  const taskColumns = useMemo(() => {
    const profiles = profileQs
      .map((q) => q.data)
      .filter((p): p is UserProfile => p != null);
    // Пока загрузились не все, колонки не строим — иначе они появлялись бы по одной
    // и сравнение прыгало бы.
    return profiles.length === authors.length ? buildTaskColumns(profiles) : [];
  }, [profileQs, authors.length]);

  const tasksLoading = profileQs.some((q) => q.isPending);

  const subtitle = `Side-by-side по периоду · ${formatRange(range.from, range.to)}${
    scope === ALL_TEAMS ? '' : ` · команда «${scope}»`
  }`;

  const isInitialLoading = dashboardQ.isPending && allItems.length === 0;
  const isError = dashboardQ.isError && allItems.length === 0;

  return (
    <>
      <PageHeader title="Сравнение разработчиков" subtitle={subtitle} />

      <PageSection>
        <CompareSelector
          options={options}
          selected={selected}
          onChange={setSelected}
          max={MAX_AUTHORS}
        />
      </PageSection>

      {isInitialLoading && <LoadingState label="Загружаем авторов" />}
      {isError && <ErrorState error={error} onRetry={() => void dashboardQ.refetch()} />}

      {!isInitialLoading && !isError && authors.length < 2 && (
        <EmptyState
          title="Выберите минимум двоих"
          description={
            options.length < 2
              ? 'В выбранной команде меньше двух разработчиков с активностью за период.'
              : 'Сравнение доступно для 2–3 разработчиков. Выберите их в поле выше.'
          }
        />
      )}

      {authors.length >= 2 && (
        <>
          <PageSection>
            <SectionTitle hint="объём, качество и активность за период">Метрики</SectionTitle>
            <CompareMatrix authors={authors} />
          </PageSection>

          <PageSection>
            <SectionTitle hint="карточки Kaiten, по которым шли коммиты">Задачи</SectionTitle>
            <CompareTasks columns={taskColumns} loading={tasksLoading} range={range} />
          </PageSection>
        </>
      )}
    </>
  );
}
