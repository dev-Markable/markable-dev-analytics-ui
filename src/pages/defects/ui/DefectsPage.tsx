import { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Col, Row, Spin, Typography } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { Bug, Search, Sparkles, UsersRound } from 'lucide-react';
import type { Dayjs } from 'dayjs';
import { PageHeader, PageSection, SectionCard, EmptyState, ErrorState, ExportButton } from '@/shared/ui';
import { useDocumentTitle, useAppMessage } from '@/shared/hooks';
import { useApiError } from '@/shared/api';
import { dayjs, toISODate, downloadCsv, formatDate } from '@/shared/lib';
import { useDateRange } from '@/features/date-range-filter';
import { ALL_TEAMS, NO_TEAM, useTeamScope } from '@/features/team-scope';
import { isElevated, useCurrentUser } from '@/entities/auth';
import {
  getTeamDefects,
  markDefectsAiAgent,
  type DefectsByPeriodRequest,
  type DefectsByPeriodResponse,
} from '@/entities/stats';
import { PeriodListEditor, type PeriodRow } from './PeriodListEditor';
import { DefectsResultTable } from './DefectsResultTable';
import { DefectsDetailTable } from './DefectsDetailTable';
import { AiAgentPie } from './AiAgentPie';
import { BulkMarkProgress } from './BulkMarkProgress';
import { applyAiAgentLocally } from '../lib/apply-ai-agent';

const MAX_PERIODS = 10;
/** С этого размера пачки показываем модалку прогресса (мелкие — мгновенны, хватает спиннера). */
const BULK_PROGRESS_THRESHOLD = 25;

export function DefectsPage() {
  useDocumentTitle('Дефекты');

  const range = useDateRange();
  const scope = useTeamScope();
  const teamSelected = scope !== ALL_TEAMS && scope !== NO_TEAM;

  // Инкрементальный id строк периодов (стабильный key, не зависит от индекса).
  const nextId = useRef(1);
  const makeRow = useCallback(
    (r: [Dayjs, Dayjs] | null): PeriodRow => ({ id: `p${nextId.current++}`, range: r }),
    [],
  );

  // Первый период по умолчанию — из глобального диапазона (осмысленный старт).
  const [periods, setPeriods] = useState<PeriodRow[]>(() => [
    makeRow([dayjs(range.from), dayjs(range.to)]),
  ]);

  const addPeriod = useCallback(() => {
    setPeriods((prev) =>
      prev.length >= MAX_PERIODS ? prev : [...prev, makeRow(null)],
    );
  }, [makeRow]);

  const removePeriod = useCallback((id: string) => {
    setPeriods((prev) => (prev.length <= 1 ? prev : prev.filter((p) => p.id !== id)));
  }, []);

  const changePeriod = useCallback((id: string, r: [Dayjs, Dayjs] | null) => {
    setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, range: r } : p)));
  }, []);

  const message = useAppMessage();
  const { data: currentUser } = useCurrentUser();
  const canMark = currentUser ? isElevated(currentUser.role) : false;

  // Результат держим в отдельном стейте: mark-действия обновляют его оптимистично
  // (без дорогого перезапроса Kaiten).
  const [result, setResult] = useState<DefectsByPeriodResponse | null>(null);

  const mutation = useMutation<DefectsByPeriodResponse, unknown, DefectsByPeriodRequest>({
    mutationFn: (body) => getTeamDefects(body),
    onSuccess: (data) => setResult(data),
  });
  const error = useApiError(mutation.error);

  const markMutation = useMutation({ mutationFn: (cardIds: number[]) => markDefectsAiAgent(cardIds) });
  // Не null → показываем модалку прогресса bulk (значение = размер пачки для оценки времени).
  const [bulkTotal, setBulkTotal] = useState<number | null>(null);

  const onMark = useCallback(
    async (cardIds: number[]) => {
      if (cardIds.length === 0) return;
      const bulk = cardIds.length >= BULK_PROGRESS_THRESHOLD;
      if (bulk) setBulkTotal(cardIds.length);
      try {
        const res = await markMutation.mutateAsync(cardIds);
        const failed = new Set(res.failedIds);
        const ok = cardIds.filter((id) => !failed.has(id));
        setResult((prev) => (prev ? applyAiAgentLocally(prev, ok) : prev));
        if (res.failedIds.length > 0) {
          message.warning(`Отмечено ${res.updated}, не удалось ${res.failedIds.length}`);
        } else {
          message.success(`Отмечено дефектов: ${res.updated}`);
        }
      } catch {
        message.error('Не удалось проставить AI-Agent');
      } finally {
        if (bulk) setBulkTotal(null);
      }
    },
    [markMutation, message],
  );

  const validPeriods = useMemo(
    () => periods.filter((p): p is PeriodRow & { range: [Dayjs, Dayjs] } => p.range !== null),
    [periods],
  );
  const canSubmit = teamSelected && validPeriods.length > 0 && !mutation.isPending;

  const submit = useCallback(() => {
    if (!teamSelected || validPeriods.length === 0) return;
    mutation.mutate({
      team: scope,
      periods: validPeriods.map((p) => ({
        from: toISODate(p.range[0]),
        to: toISODate(p.range[1]),
      })),
    });
  }, [teamSelected, validPeriods, mutation, scope]);

  const exportDefects = useCallback(() => {
    const rows = result?.defects ?? [];
    downloadCsv(`defects-${scope}.csv`, rows, [
      { header: 'Дефект', value: (d) => d.title },
      { header: 'Ссылка', value: (d) => d.url ?? '' },
      {
        header: 'Участники',
        value: (d) => d.members.map((m) => m.displayName ?? m.email ?? '').filter(Boolean).join(', '),
      },
      { header: 'AI-Agent', value: (d) => (d.aiAgent ? 'Да' : 'Нет') },
      { header: 'Создан', value: (d) => formatDate(d.createdAt) },
    ]);
  }, [result, scope]);

  const subtitle = teamSelected
    ? `Уникальные дефекты команды «${scope}» по приоритету за выбранные периоды`
    : 'Дефекты по приоритету, команда, периоды';

  return (
    <>
      <PageHeader title="Дефекты по приоритету" subtitle={subtitle} />

      {!teamSelected ? (
        <PageSection>
          <EmptyState
            icon={<UsersRound size={28} strokeWidth={1.5} />}
            title="Выберите команду"
            description="Раздел показывает дефекты выбранной команды. Выберите команду в фильтре команд сверху (сейчас — «вся компания»)."
          />
        </PageSection>
      ) : (
        <>
          <PageSection>
            <Row gutter={[16, 16]} align="stretch">
              <Col xs={24} xl={15}>
                <SectionCard title="Периоды" icon={<Bug size={18} />}>
                  <PeriodListEditor
                    periods={periods}
                    maxPeriods={MAX_PERIODS}
                    disabled={mutation.isPending}
                    onAdd={addPeriod}
                    onRemove={removePeriod}
                    onChange={changePeriod}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      icon={<Search size={16} />}
                      loading={mutation.isPending}
                      disabled={!canSubmit}
                      onClick={submit}
                    >
                      Показать дефекты
                    </Button>
                  </div>
                </SectionCard>
              </Col>
              <Col xs={24} xl={9}>
                <SectionCard title="Доля с AI-агентом" icon={<Sparkles size={18} />}>
                  {result ? (
                    <Spin spinning={mutation.isPending}>
                      <AiAgentPie
                        withAi={result.periods.reduce((s, p) => s + p.aiAgentCount, 0)}
                        total={result.periods.reduce((s, p) => s + p.total, 0)}
                      />
                    </Spin>
                  ) : (
                    <Typography.Text type="secondary">
                      Задайте периоды и нажмите «Показать дефекты».
                    </Typography.Text>
                  )}
                </SectionCard>
              </Col>
            </Row>
          </PageSection>

          {mutation.isError && !result ? (
            <PageSection>
              <ErrorState error={error} onRetry={submit} />
            </PageSection>
          ) : result ? (
            <Spin spinning={mutation.isPending}>
              <PageSection>
                <SectionCard title="Результат" icon={<Bug size={18} />}>
                  <DefectsResultTable data={result} />
                </SectionCard>
              </PageSection>
              <PageSection>
                <SectionCard
                  title="Дефекты"
                  icon={<Bug size={18} />}
                  actions={
                    <ExportButton onExportCsv={exportDefects} disabled={result.defects.length === 0} />
                  }
                >
                  <DefectsDetailTable
                    defects={result.defects}
                    canMark={canMark}
                    marking={markMutation.isPending}
                    onMark={onMark}
                  />
                </SectionCard>
              </PageSection>
            </Spin>
          ) : null}
        </>
      )}

      <BulkMarkProgress open={bulkTotal !== null} total={bulkTotal ?? 0} />
    </>
  );
}
