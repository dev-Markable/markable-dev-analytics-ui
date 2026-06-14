import { Col, Row } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, PageSection } from '@/shared/ui';
import { useApiErrorNotification, useDocumentTitle } from '@/shared/hooks';
import { queryToAsyncState, useApiError } from '@/shared/api';
import { useDateRange } from '@/features/date-range-filter';
import { ALL_TEAMS, NO_TEAM, useTeamScope } from '@/features/team-scope';
import {
  cohortActivityMatrixQuery,
  cohortRetentionQuery,
  tierTransitionsQuery,
} from '@/entities/cohort';
import { RetentionTriangle } from '@/widgets/cohorts/retention-triangle';
import { RetentionCurve } from '@/widgets/cohorts/retention-curve';
import { TierTransitionMatrix } from '@/widgets/cohorts/tier-transitions';
import { ActivityMatrix } from '@/widgets/cohorts/activity-matrix';

export function CohortsPage() {
  useDocumentTitle('Когорты');

  const range = useDateRange();
  const scope = useTeamScope();
  // Бэк фильтрует по имени команды; ALL_TEAMS / NO_TEAM серверного параметра не
  // имеют, поэтому шлём team только для конкретной команды (иначе — вся компания).
  const team = scope !== ALL_TEAMS && scope !== NO_TEAM ? scope : undefined;

  // Окно истории не задаём — бэк отдаёт всю историю (страница про весь состав).
  const retentionQ = useQuery(cohortRetentionQuery({ team }));
  const matrixQ = useQuery(cohortActivityMatrixQuery({ team }));
  const transitionsQ = useQuery(tierTransitionsQuery({ team }));

  const error = useApiError(retentionQ.error);
  useApiErrorNotification(error, 'Не удалось загрузить когорты');

  const subtitle = `Вся история активности${team ? ` · команда ${team}` : ' · все команды'}`;

  return (
    <>
      <PageHeader title="Когорты и удержание" subtitle={subtitle} />

      <PageSection>
        <RetentionTriangle
          state={queryToAsyncState(retentionQ)}
          onRetry={() => void retentionQ.refetch()}
        />
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <RetentionCurve
              state={queryToAsyncState(retentionQ)}
              onRetry={() => void retentionQ.refetch()}
            />
          </Col>
          <Col xs={24} xl={12}>
            <TierTransitionMatrix
              state={queryToAsyncState(transitionsQ)}
              onRetry={() => void transitionsQ.refetch()}
            />
          </Col>
        </Row>
      </PageSection>

      <PageSection>
        <ActivityMatrix
          state={queryToAsyncState(matrixQ)}
          range={range}
          onRetry={() => void matrixQ.refetch()}
        />
      </PageSection>
    </>
  );
}
