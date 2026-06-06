import { useCallback, useEffect, useMemo } from 'react';
import { Button, Col, Row } from 'antd';
import { Printer } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { PageHeader, PageSection, EmptyState, ErrorState, LoadingState } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { type DateRange } from '@/shared/lib';
import { useUsersStore } from '@/entities/user';
import { usePerformanceStore } from '@/entities/performance-review';
import { PerfControls, DEFAULT_PERF_PERIOD, presetRange } from '@/widgets/perf-controls';
import { PerfSubject } from '@/widgets/perf-subject';
import { CodeSummaryCard } from '@/widgets/perf-code-summary';
import { ReviewSummaryCard } from '@/widgets/perf-review-summary';
import { DefectsByUrgency } from '@/widgets/perf-kaiten-defects';
import { DevelopmentRollupCard } from '@/widgets/perf-kaiten-development';
import { CycleTimeCard } from '@/widgets/perf-kaiten-cycle';
import { WorkBalanceCard } from '@/widgets/perf-kaiten-balance';
import { PerfHighlights } from '@/widgets/perf-highlights';

const DEFAULT_RANGE = presetRange(DEFAULT_PERF_PERIOD === 'custom' ? 'quarter' : DEFAULT_PERF_PERIOD);

export function PerformanceReviewPage() {
  useDocumentTitle('Performance Review');

  const [searchParams, setSearchParams] = useSearchParams();
  const usersFetch = useUsersStore((s) => s.fetch);

  const state = usePerformanceStore(useShallow((s) => s.state));
  const fetchReview = usePerformanceStore((s) => s.fetch);

  useEffect(() => {
    void usersFetch();
  }, [usersFetch]);

  // Источник правды — URL: ?email&from&to&compare. Шарится и переживает перезагрузку.
  const email = searchParams.get('email');
  const range = useMemo<DateRange>(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    return from && to ? { from, to } : DEFAULT_RANGE;
  }, [searchParams]);
  const compare = searchParams.get('compare') === '1';

  const patchParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(patch)) {
        if (value == null) next.delete(key);
        else next.set(key, value);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleEmail = useCallback((e: string) => patchParams({ email: e }), [patchParams]);
  const handleRange = useCallback(
    (r: DateRange) => patchParams({ from: r.from, to: r.to }),
    [patchParams],
  );
  const handleCompare = useCallback(
    (c: boolean) => patchParams({ compare: c ? '1' : null }),
    [patchParams],
  );

  useEffect(() => {
    if (!email) return;
    void fetchReview({ email, from: range.from, to: range.to, compareToPrevious: compare });
  }, [email, range.from, range.to, compare, fetchReview]);

  useApiErrorNotification(state.error, 'Не удалось загрузить досье');

  const review = state.data;
  const isLoading = state.status === 'loading' && !review;
  const isError = state.status === 'error' && !review;
  // Показываем данные предыдущего email, пока грузится новый — но не если email сменился.
  const reviewMatchesEmail = review?.subject.email === email;

  return (
    <>
      <PageHeader
        title="Performance Review"
        subtitle="Досье разработчика за период: метрики с дельтами, задачи Kaiten и пруфы для разговора 1:1"
        extra={
          review && reviewMatchesEmail ? (
            <Button icon={<Printer size={16} />} onClick={() => window.print()}>
              Печать / PDF
            </Button>
          ) : undefined
        }
      />

      <PageSection>
        <PerfControls
          email={email}
          range={range}
          compare={compare}
          onEmailChange={handleEmail}
          onRangeChange={handleRange}
          onCompareChange={handleCompare}
        />
      </PageSection>

      {!email && (
        <EmptyState
          title="Выберите разработчика"
          description="Укажите человека и период выше — соберём досье с метриками, задачами и заметными результатами."
        />
      )}

      {email && isLoading && <LoadingState label="Собираем досье" />}

      {email && isError && (
        <ErrorState
          error={state.error}
          onRetry={() =>
            fetchReview({ email, from: range.from, to: range.to, compareToPrevious: compare })
          }
        />
      )}

      {email && review && reviewMatchesEmail && (
        <div className="perf-review">
          <PageSection>
            <PerfSubject review={review} />
          </PageSection>

          <PageSection>
            <Row gutter={[16, 16]}>
              <Col xs={24} xl={12}>
                <CodeSummaryCard metrics={review.metrics} />
              </Col>
              <Col xs={24} xl={12}>
                <ReviewSummaryCard metrics={review.metrics} />
              </Col>
            </Row>
          </PageSection>

          <PageSection>
            <DefectsByUrgency defects={review.kaiten.defects} />
          </PageSection>

          <PageSection>
            <DevelopmentRollupCard rollup={review.kaiten.development} />
          </PageSection>

          <PageSection>
            <Row gutter={[16, 16]}>
              <Col xs={24} xl={12}>
                <CycleTimeCard cycle={review.kaiten.cycleTime} />
              </Col>
              <Col xs={24} xl={12}>
                <WorkBalanceCard balance={review.kaiten.balance} />
              </Col>
            </Row>
          </PageSection>

          <PageSection>
            <PerfHighlights highlights={review.highlights} />
          </PageSection>
        </div>
      )}
    </>
  );
}
