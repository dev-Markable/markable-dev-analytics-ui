import { Button, Card, Typography } from 'antd';
import { Activity, RefreshCw } from 'lucide-react';
import type { AsyncState } from '@/shared/api';
import {
  RunStatusTag,
  formatDuration,
  type CollectionRun,
} from '@/entities/collection-run';
import { EmptyState, ErrorState } from '@/shared/ui';
import { formatDateTime, formatRelative } from '@/shared/lib';

interface CurrentRunCardProps {
  state: AsyncState<CollectionRun>;
  onRefresh: (id: string) => void;
}

function RunDetails({ run, onRefresh }: { run: CollectionRun; onRefresh: () => void }) {
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
          style={{ alignSelf: 'flex-start' }}
        >
          Обновить статус
        </Button>
      )}
    </>
  );
}

export function CurrentRunCard({ state, onRefresh }: CurrentRunCardProps) {
  const run = state.data;
  const isLoading = state.status === 'loading';

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
          {isLoading
            ? 'Цикл в процессе…'
            : run
              ? 'Информация о последнем запуске'
              : 'Ещё не запускали в этой сессии'}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="run-card">
          {state.status === 'error' && !run && (
            <ErrorState error={state.error} title="Не удалось получить прогон" />
          )}
          {!run && state.status !== 'error' && (
            <EmptyState
              title="Прогонов нет в кэше"
              description="Запустите сбор через форму ниже — здесь появится статус."
            />
          )}
          {run && (
            <RunDetails
              run={run}
              onRefresh={() => onRefresh(run.id)}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
