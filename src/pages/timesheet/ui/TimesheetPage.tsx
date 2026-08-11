import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CalendarClock, UserRound } from 'lucide-react';
import {
  PageHeader,
  PageSection,
  SectionCard,
  EmptyState,
  ErrorState,
  LoadingState,
  ExportButton,
} from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';
import { useApiError } from '@/shared/api';
import { downloadCsv, formatRange } from '@/shared/lib';
import { useDateRange } from '@/features/date-range-filter';
import { isElevated, useCurrentUser } from '@/entities/auth';
import { timesheetQuery, type TimesheetEntry } from '@/entities/stats';
import { TimesheetDays } from './TimesheetDays';
import { TimesheetHero } from './TimesheetHero';
import { toHours } from '../lib/hours';

/** Строка CSV-выгрузки: день + задача (или день без списаний по задачам). */
interface CsvRow {
  date: string;
  entry: TimesheetEntry | null;
}

export function TimesheetPage() {
  useDocumentTitle('Таймшит');

  const range = useDateRange();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: me } = useCurrentUser();

  // RBAC: MEMBER видит только свой таймшит — email форсится на собственный (бэк дублирует 403).
  const lockedToSelf = Boolean(me && !isElevated(me.role));
  const email = lockedToSelf ? (me?.email ?? null) : searchParams.get('email');

  const setEmail = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('email', next);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const q = useQuery(timesheetQuery({ from: range.from, to: range.to, email: email ?? '' }));
  const error = useApiError(q.error);
  const data = q.data ?? null;

  const days = useMemo(() => data?.days ?? [], [data]);

  // CSV — построчно по задачам (как в ручной таблице): дата, задача, ссылка, тип, AI, MR, часы.
  const csvRows = useMemo<CsvRow[]>(
    () =>
      days.flatMap((d): CsvRow[] =>
        d.entries.length > 0
          ? d.entries.map((e) => ({ date: d.date, entry: e }))
          : [{ date: d.date, entry: null }],
      ),
    [days],
  );

  const exportCsv = useCallback(() => {
    downloadCsv(`timesheet-${email ?? 'developer'}-${range.from}_${range.to}.csv`, csvRows, [
      { header: 'Дата', value: (r) => r.date },
      { header: 'Задача', value: (r) => r.entry?.title ?? '' },
      { header: 'Ссылка на задачу', value: (r) => r.entry?.url ?? '' },
      { header: 'Тип', value: (r) => r.entry?.type ?? '' },
      { header: 'AI', value: (r) => (r.entry?.aiAgent ? 'Да' : 'Нет') },
      {
        header: 'MR',
        value: (r) => (r.entry?.mergeRequests ?? []).map((m) => m.url).join(' | '),
      },
      { header: 'Часы', value: (r) => (r.entry ? toHours(r.entry.minutes) : '') },
    ]);
  }, [csvRows, email, range.from, range.to]);

  const subtitle = `${formatRange(range.from, range.to)} · трудозатраты из Kaiten`;

  return (
    <>
      <PageHeader title="Таймшит" subtitle={subtitle} />

      <PageSection>
        <TimesheetHero email={email} onChange={setEmail} locked={lockedToSelf} data={data} />
      </PageSection>

      {!email ? (
        <PageSection>
          <EmptyState
            icon={<UserRound size={28} strokeWidth={1.5} />}
            title="Выберите разработчика"
            description="Укажите, чьи трудозатраты показать за выбранный период."
          />
        </PageSection>
      ) : q.isPending ? (
        <PageSection>
          <LoadingState label="Загружаем списания из Kaiten" />
        </PageSection>
      ) : q.isError ? (
        <PageSection>
          <ErrorState error={error} onRetry={() => void q.refetch()} />
        </PageSection>
      ) : data ? (
        <>
          <PageSection>
            <SectionCard
              title="По дням"
              icon={<CalendarClock size={18} />}
              actions={<ExportButton onExportCsv={exportCsv} disabled={days.length === 0} />}
            >
              {days.length === 0 ? (
                <EmptyState
                  title="Списаний нет"
                  description="За выбранный период в Kaiten нет списаний времени."
                />
              ) : (
                <TimesheetDays days={days} />
              )}
            </SectionCard>
          </PageSection>
        </>
      ) : null}
    </>
  );
}
