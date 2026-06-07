import { useState } from 'react';
import { Alert, Button, Card, DatePicker, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { Play } from 'lucide-react';
import { useTriggerCollection } from '@/entities/collection-run';
import { useApiError } from '@/shared/api';
import { useNotification, useApiErrorNotification } from '@/shared/hooks';

export function CollectionTriggerCard() {
  const trigger = useTriggerCollection();
  const notification = useNotification();

  // Сетевой/серверный сбой самого POST (≠ run.status === 'FAILED') —
  // показываем тостом, как раньше делал page-level useApiErrorNotification.
  const triggerError = useApiError(trigger.error);
  useApiErrorNotification(triggerError, 'Сбор завершился ошибкой');

  const [since, setSince] = useState<Dayjs | null>(null);
  const isRunning = trigger.isPending;

  const handleTrigger = async (): Promise<void> => {
    const run = await trigger
      .mutateAsync(since ? since.format('YYYY-MM-DDTHH:mm:ss') : undefined)
      .catch(() => null); // сетевой сбой уже уйдёт тостом через triggerError
    if (!run) return;

    if (run.status === 'SUCCESS') {
      notification.success({
        message: 'Сбор завершён',
        description: `Прогон ${run.id} завершён успешно.`,
      });
    } else if (run.status === 'FAILED') {
      notification.error({
        message: 'Сбор завершился ошибкой',
        description: run.errorMessage ?? 'Подробности в логах сервера.',
      });
    }
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
                disabled={isRunning}
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
                loading={isRunning}
              >
                {isRunning ? 'Идёт сбор…' : 'Запустить'}
              </Button>
            </Space>
          </Space>
        </div>
      </div>
    </Card>
  );
}
