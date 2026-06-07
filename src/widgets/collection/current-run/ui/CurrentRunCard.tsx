import { useEffect, useRef, useState } from 'react';
import { Button, Card, Popconfirm, Spin, Typography } from 'antd';
import { useIsMutating } from '@tanstack/react-query';
import { Activity, Ban, RefreshCw } from 'lucide-react';
import { useApiError } from '@/shared/api';
import {
  RunStatusTag,
  formatDuration,
  useCancelRun,
  useLatestRun,
  TRIGGER_MUTATION_KEY,
  type CollectionRun,
} from '@/entities/collection-run';
import { EmptyState, ErrorState } from '@/shared/ui';
import { useNotification } from '@/shared/hooks';
import { formatDateTime, formatRelative } from '@/shared/lib';

function RunDetails({
  run,
  onRefresh,
  refreshing,
  onCancel,
  cancelling,
  cancelRequested,
}: {
  run: CollectionRun;
  onRefresh: () => void;
  refreshing: boolean;
  onCancel: () => void;
  cancelling: boolean;
  cancelRequested: boolean;
}) {
  const isRunning = run.status === 'RUNNING';

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
            <dt>{run.status === 'CANCELLED' ? 'Причина отмены' : 'Ошибка'}</dt>
            <dd>{run.errorMessage}</dd>
          </div>
        )}
      </dl>

      {isRunning && (
        <div className="run-card__actions">
          <Button
            icon={<RefreshCw size={14} />}
            onClick={onRefresh}
            loading={refreshing}
          >
            Обновить статус
          </Button>

          {cancelRequested ? (
            <Typography.Text type="secondary" className="run-card__cancel-hint">
              <Ban size={13} /> Отмена запрошена — остановится в ближайшей точке…
            </Typography.Text>
          ) : (
            <Popconfirm
              title="Отменить прогон?"
              description="Сбор остановится в ближайшей безопасной точке. Данные останутся консистентными — следующий прогон доберёт недостающее."
              okText="Отменить"
              okButtonProps={{ danger: true }}
              cancelText="Продолжить"
              onConfirm={onCancel}
            >
              <Button danger icon={<Ban size={14} />} loading={cancelling}>
                Отменить
              </Button>
            </Popconfirm>
          )}
        </div>
      )}
    </>
  );
}

export function CurrentRunCard() {
  const { data: run, error, isLoading, refetch } = useLatestRun();
  const cancel = useCancelRun();
  const notification = useNotification();
  // Ручное обновление отделено от фонового poll: `isFetching` истинно и на
  // каждом 3-секундном refetchInterval, иначе кнопка спиннерила бы сама по себе.
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const handleRefresh = (): void => {
    setManualRefreshing(true);
    void refetch().finally(() => setManualRefreshing(false));
  };
  // Триггер сбора живёт в соседнем CollectionTriggerCard — узнаём о его
  // выполнении через глобальный счётчик мутаций по ключу.
  const triggering = useIsMutating({ mutationKey: TRIGGER_MUTATION_KEY }) > 0;
  const queryError = useApiError(error);

  // Синхронный POST уже стартовал, но строка прогона ещё не видна как RUNNING —
  // не показываем стейл-детали прошлого прогона, рисуем «запускаем».
  const starting = triggering && run?.status !== 'RUNNING';
  // 202 на отмену уже получен по текущему прогону, ждём перехода в CANCELLED.
  const cancelRequested =
    cancel.isSuccess && cancel.variables === run?.id && run?.status === 'RUNNING';

  // Терминальный исход теперь не возвращается из POST (он асинхронный, отдаёт
  // лишь RUNNING) — наблюдаем переход RUNNING → терминал поллингом и уведомляем
  // здесь, в карточке-наблюдателе прогона.
  const prevStatusRef = useRef(run?.status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = run?.status;
    if (prev !== 'RUNNING' || !run || run.status === 'RUNNING') return;

    if (run.status === 'SUCCESS') {
      notification.success({
        message: 'Сбор завершён',
        description: `Прогон ${run.id} завершён успешно.`,
      });
    } else if (run.status === 'CANCELLED') {
      notification.info({
        message: 'Сбор отменён',
        description: 'Прогон остановлен по запросу. Следующий запуск доберёт недостающее.',
      });
    } else if (run.status === 'FAILED') {
      notification.error({
        message: 'Сбор завершился ошибкой',
        description: run.errorMessage ?? 'Подробности в логах сервера.',
      });
    }
  }, [run, notification]);

  const handleCancel = (): void => {
    if (!run) return;
    cancel.mutate(run.id, {
      onError: (e) => {
        // 409 = прогон уже терминальный (успел завершиться сам), 404 = его нет.
        // В обоих случаях достаточно подтянуть актуальный статус.
        if (e.status === 409 || e.isNotFound) {
          void refetch();
          notification.info({
            message: 'Отменять нечего',
            description: 'Прогон уже завершился — обновили статус.',
          });
          return;
        }
        notification.error({
          message: 'Не удалось отменить прогон',
          description: e.detail ?? e.title,
        });
      },
      onSuccess: () => void refetch(),
    });
  };

  const description = triggering
    ? 'Цикл в процессе…'
    : run?.status === 'RUNNING'
      ? 'Идёт сбор данных'
      : run
        ? 'Информация о последнем запуске'
        : 'Прогонов ещё не было';

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
          {description}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="run-card">
          {isLoading && !run ? (
            <div className="run-card__loading">
              <Spin />
            </div>
          ) : starting ? (
            <div className="run-card__loading">
              <Spin />
              <Typography.Text type="secondary">Запускаем цикл сбора…</Typography.Text>
            </div>
          ) : queryError && !run ? (
            <ErrorState error={queryError} title="Не удалось получить прогон" />
          ) : !run ? (
            <EmptyState
              title="Прогонов ещё не было"
              description="Запустите сбор через форму ниже — здесь появится статус."
            />
          ) : (
            <RunDetails
              run={run}
              onRefresh={handleRefresh}
              refreshing={manualRefreshing}
              onCancel={handleCancel}
              cancelling={cancel.isPending}
              cancelRequested={cancelRequested}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
