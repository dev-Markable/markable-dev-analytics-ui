import { Button, Card, Typography } from 'antd';
import { RefreshCcw } from 'lucide-react';
import { useSyncKaiten } from '@/entities/collection-run';
import { ApiError, toApiError } from '@/shared/api';
import { useNotification } from '@/shared/hooks';
import { formatNumber } from '@/shared/lib';

export function KaitenSyncCard() {
  const sync = useSyncKaiten();
  const notification = useNotification();

  const isRunning = sync.isPending;
  const lastResult = sync.data;

  const handleSync = async (): Promise<void> => {
    try {
      const result = await sync.mutateAsync();
      notification.success({
        message: 'Kaiten-пользователи синхронизированы',
        description: `Обновлено ${formatNumber(result.synced)} записей.`,
      });
    } catch (e) {
      const apiError = e instanceof ApiError ? e : toApiError(e);
      notification.error({
        message: 'Синхронизация не удалась',
        description: apiError.detail ?? apiError.title ?? 'Подробности в логах.',
      });
    }
  };

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <RefreshCcw size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Синхронизация Kaiten
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Подтянуть актуальный список пользователей из Kaiten в `unified_user`
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="collection-trigger">
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12, fontSize: 13 }}>
            Используется как ручной триггер, если обычный прогон сбора почему-то не подтянул новые
            аватары / имена. Идемпотентно: upsert по `kaiten_id`.
          </Typography.Paragraph>

          {lastResult && (
            <Typography.Text style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
              Последняя синхронизация: <strong>{formatNumber(lastResult.synced)}</strong>{' '}
              пользователей
            </Typography.Text>
          )}

          <Button icon={<RefreshCcw size={14} />} onClick={handleSync} loading={isRunning}>
            {isRunning ? 'Синхронизация…' : 'Синхронизировать'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
