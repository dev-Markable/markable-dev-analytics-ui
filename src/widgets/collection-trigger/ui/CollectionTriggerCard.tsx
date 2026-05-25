import { useState } from 'react';
import { Alert, Button, Card, DatePicker, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { Play } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useCollectionStore } from '@/entities/collection-run';
import { useNotification } from '@/shared/hooks';

export function CollectionTriggerCard() {
  const { lastRun } = useCollectionStore(useShallow((s) => ({ lastRun: s.lastRun })));
  const trigger = useCollectionStore((s) => s.trigger);
  const notification = useNotification();

  const [since, setSince] = useState<Dayjs | null>(null);
  const isRunning = lastRun.status === 'loading';

  const handleTrigger = async (): Promise<void> => {
    await trigger(since ? since.format('YYYY-MM-DDTHH:mm:ss') : undefined);
    const { lastRun: finished } = useCollectionStore.getState();
    if (finished.status === 'success' && finished.data) {
      if (finished.data.status === 'SUCCESS') {
        notification.success({
          message: 'Сбор завершён',
          description: `Прогон ${finished.data.id} завершён успешно.`,
        });
      } else if (finished.data.status === 'FAILED') {
        notification.error({
          message: 'Сбор завершился ошибкой',
          description: finished.data.errorMessage ?? 'Подробности в логах сервера.',
        });
      }
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
