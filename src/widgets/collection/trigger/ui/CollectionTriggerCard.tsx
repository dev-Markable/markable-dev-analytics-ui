import { useState } from 'react';
import { Alert, Button, Card, DatePicker, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { Play } from 'lucide-react';
import { useLatestRun, useTriggerCollection } from '@/entities/collection-run';
import { useApiError } from '@/shared/api';
import { useNotification, useApiErrorNotification } from '@/shared/hooks';

export function CollectionTriggerCard() {
  const trigger = useTriggerCollection();
  const { data: run } = useLatestRun();
  const notification = useNotification();

  // Сбой самого запуска (сеть / 409 «уже идёт») — тостом. Терминальный исход
  // прогона (SUCCESS/FAILED/CANCELLED) сюда больше не приходит: POST асинхронен
  // и отдаёт лишь RUNNING — итог наблюдает CurrentRunCard поллингом.
  const triggerError = useApiError(trigger.error);
  useApiErrorNotification(triggerError, 'Не удалось запустить сбор');

  const [since, setSince] = useState<Dayjs | null>(null);
  // Блокируем запуск, пока есть активный прогон (свой или чужой) — иначе бэк
  // ответит 409 (single-flight). isPending покрывает миг до прихода 202.
  const isBusy = trigger.isPending || run?.status === 'RUNNING';

  const handleTrigger = async (): Promise<void> => {
    const started = await trigger
      .mutateAsync(since ? since.format('YYYY-MM-DDTHH:mm:ss') : undefined)
      .catch(() => null); // ошибка запуска уже уйдёт тостом через triggerError
    if (!started) return;

    notification.info({
      message: 'Сбор запущен',
      description: `Прогон ${started.id} идёт в фоне — статус и отмена в карточке выше.`,
    });
  };

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Play size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Запустить сбор
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Git коммиты → daily stats → синхронизация Kaiten-пользователей
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="collection-trigger">
          <Alert
            type="info"
            showIcon
            message="Если не указать дату — бэк продолжит с конца последнего успешного прогона."
            style={{ marginBottom: 16 }}
          />

          <Space size={12} wrap>
            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Начать с (опционально)
              </Typography.Text>
              <DatePicker
                showTime={{ format: 'HH:mm' }}
                format="D MMM YYYY HH:mm"
                value={since}
                onChange={setSince}
                placeholder="С даты"
                style={{ minWidth: 240 }}
                disabled={isBusy}
              />
            </Space>
            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                &nbsp;
              </Typography.Text>
              <Button
                type="primary"
                icon={<Play size={14} />}
                onClick={handleTrigger}
                loading={trigger.isPending}
                disabled={isBusy}
              >
                {isBusy ? 'Идёт сбор…' : 'Запустить'}
              </Button>
            </Space>
          </Space>
        </div>
      </div>
    </Card>
  );
}
