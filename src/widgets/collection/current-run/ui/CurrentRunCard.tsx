import { Button, Card, Typography } from 'antd';
import { useIsMutating } from '@tanstack/react-query';
import { Activity, RefreshCw } from 'lucide-react';
import { useApiError } from '@/shared/api';
import {
  RunStatusTag,
  formatDuration,
  useCurrentRun,
  useRefreshRun,
  TRIGGER_MUTATION_KEY,
  type CollectionRun,
} from '@/entities/collection-run';
import { EmptyState, ErrorState } from '@/shared/ui';
import { formatDateTime, formatRelative } from '@/shared/lib';

function RunDetails({
  run,
  onRefresh,
  refreshing,
}: {
  run: CollectionRun;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <>
      <div className="run-card__head">
        <RunStatusTag status={run.status} size="large" />
        <Typography.Text type="secondary" className="run-card__finished">
          {run.finishedAt
            ? `Завершён ${formatRelative(run.finishedAt)}`
            : `Запущен ${formatRelative(run.startedAt)}`}
        </Typography.Text>
      </div>

      <dl className="run-card__details">
        <div>
          <dt>Период</dt>
          <dd>
            {formatDateTime(run.sinceDate)}
            {' — '}
            {run.untilDate ? formatDateTime(run.untilDate) : '…'}
          </dd>
        </div>
        <div>
          <dt>Длительность</dt>
          <dd>{formatDuration(run.startedAt, run.finishedAt)}</dd>
        </div>
        <div>
          <dt>ID прогона</dt>
          <dd className="run-card__id">{run.id}</dd>
        </div>
        {run.errorMessage && (
          <div className="run-card__error">
            <dt>Ошибка</dt>
            <dd>{run.errorMessage}</dd>
          </div>
        )}
      </dl>

      {run.status === 'RUNNING' && (
        <Button
          icon={<RefreshCw size={14} />}
          onClick={onRefresh}
          loading={refreshing}
          style={{ alignSelf: 'flex-start' }}
        >
          Обновить статус
        </Button>
      )}
    </>
  );
}

export function CurrentRunCard() {
  const { data: run } = useCurrentRun();
  const refresh = useRefreshRun();
  // Триггер сбора живёт в соседнем CollectionTriggerCard — узнаём о его
  // выполнении через глобальный счётчик мутаций по ключу.
  const triggering = useIsMutating({ mutationKey: TRIGGER_MUTATION_KEY }) > 0;
  const refreshError = useApiError(refresh.error);

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Activity size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Последний прогон
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {triggering
            ? 'Цикл в процессе…'
            : run
              ? 'Информация о последнем запуске'
              : 'Ещё не запускали в этой сессии'}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="run-card">
          {refreshError && !run && (
            <ErrorState error={refreshError} title="Не удалось получить прогон" />
          )}
          {!run && !refreshError && (
            <EmptyState
              title="Прогонов нет в кэше"
              description="Запустите сбор через форму ниже — здесь появится статус."
            />
          )}
          {run && (
            <RunDetails
              run={run}
              onRefresh={() => refresh.mutate(run.id)}
              refreshing={refresh.isPending}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
