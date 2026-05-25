import { Button, Card, Typography } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { RefreshCcw } from 'lucide-react';
import { useCollectionStore } from '@/entities/collection-run';
import { useNotification } from '@/shared/hooks';
import { formatNumber } from '@/shared/lib';

export function KaitenSyncCard() {
  const { kaitenSync } = useCollectionStore(useShallow((s) => ({ kaitenSync: s.kaitenSync })));
  const syncKaiten = useCollectionStore((s) => s.syncKaiten);
  const notification = useNotification();

  const isRunning = kaitenSync.status === 'loading';

  const handleSync = async (): Promise<void> => {
    await syncKaiten();
    const fresh = useCollectionStore.getState().kaitenSync;
    if (fresh.status === 'success' && fresh.data) {
      notification.success({
        message: 'Kaiten-пользователи синхронизированы',
        description: `Обновлено ${formatNumber(fresh.data.synced)} записей.`,
      });
    } else if (fresh.status === 'error') {
      notification.error({
        message: 'Синхронизация не удалась',
        description: fresh.error?.detail ?? fresh.error?.title ?? 'Подробности в логах.',
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

          {kaitenSync.data && (
            <Typography.Text style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
              Последняя синхронизация: <strong>{formatNumber(kaitenSync.data.synced)}</strong>{' '}
              пользователей
            </Typography.Text>
          )}

          <Button
            icon={<RefreshCcw size={14} />}
            onClick={handleSync}
            loading={isRunning}
          >
            {isRunning ? 'Синхронизация…' : 'Синхронизировать'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
