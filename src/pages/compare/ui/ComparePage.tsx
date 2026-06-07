import { useCallback, useMemo } from 'react';
import { Col, Row } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, PageSection, EmptyState, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { dashboardQuery } from '@/entities/dashboard';
import { useApiError } from '@/shared/api';
import type { AuthorActivity } from '@/entities/user';
import { formatRange } from '@/shared/lib';
import { CompareSelector } from '@/widgets/compare-selector';
import { CompareRadar } from '@/widgets/compare-radar';
import { CompareTable } from '@/widgets/compare-table';

const MAX_AUTHORS = 3;
const PARAM = 'ids';

export function ComparePage() {
  useDocumentTitle('Сравнение');

  const range = useDateRange();
  const [searchParams, setSearchParams] = useSearchParams();

  const dashboardQ = useQuery(dashboardQuery({ from: range.from, to: range.to }));
  const error = useApiError(dashboardQ.error);
  useApiErrorNotification(error, 'Не удалось загрузить данные для сравнения');

  const allItems = useMemo(() => dashboardQ.data?.items ?? [], [dashboardQ.data]);

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

  // Авторы для сравнения — пересечение выбранных email и загруженных items.
  // Порядок — как в selected (стабильность цветов серий).
  const authors = useMemo<AuthorActivity[]>(() => {
    const byEmail = new Map(allItems.map((a) => [a.email, a]));
    return selected
      .map((email) => byEmail.get(email))
      .filter((a): a is AuthorActivity => a != null);
  }, [selected, allItems]);

  const subtitle = `Side-by-side по периоду · ${formatRange(range.from, range.to)}`;

  const isInitialLoading = dashboardQ.isPending && allItems.length === 0;
  const isError = dashboardQ.isError && allItems.length === 0;

  return (
    <>
      <PageHeader title="Сравнение разработчиков" subtitle={subtitle} />

      <PageSection>
        <CompareSelector
          options={allItems}
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
          description="Сравнение доступно для 2–3 разработчиков. Выберите их в поле выше."
        />
      )}

      {authors.length >= 2 && (
        <PageSection>
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
              <CompareRadar authors={authors} />
            </Col>
            <Col xs={24} xl={12}>
              <CompareTable authors={authors} range={range} />
            </Col>
          </Row>
        </PageSection>
      )}
    </>
  );
}
