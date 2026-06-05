import { App, Button, Card, Typography } from 'antd';
import { RotateCcw, Server } from 'lucide-react';
import { APP_NAME, env } from '@/shared/config';

const PERSIST_KEYS = [
  'devpulse.theme',
  'devpulse.date-range',
  'devpulse.team-scope',
  // Устаревшие ключи (clientside allowlist) — чистим, если они остались с прошлых версий.
  'devpulse.team-filter',
  'devpulse.team-members',
];

const APP_VERSION = '2.0.0';
const BUILD_MODE = import.meta.env.MODE;

export function SystemCard() {
  const { modal } = App.useApp();

  const handleReset = (): void => {
    modal.confirm({
      title: 'Сбросить все настройки?',
      content:
        'Тема, диапазон дат и выбранная команда вернутся к значениям по умолчанию. Страница перезагрузится.',
      okText: 'Сбросить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => {
        for (const key of PERSIST_KEYS) {
          localStorage.removeItem(key);
        }
        window.location.reload();
      },
    });
  };

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Server size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Источник данных
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Подключение к бэку и техническая информация
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <dl className="settings-meta">
          <div>
            <dt>API endpoint</dt>
            <dd className="settings-meta__mono">{env.apiBaseUrl}</dd>
          </div>
          <div>
            <dt>Версия фронта</dt>
            <dd className="settings-meta__mono">
              {APP_NAME} {APP_VERSION}
            </dd>
          </div>
          <div>
            <dt>Сборка</dt>
            <dd className="settings-meta__mono">{BUILD_MODE}</dd>
          </div>
        </dl>

        <div className="settings-divider" />

        <div className="settings-row">
          <div className="settings-row__main">
            <Typography.Text strong style={{ fontSize: 14 }}>
              Сбросить все настройки
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Очистит localStorage и перезагрузит страницу
            </Typography.Text>
          </div>
          <div className="settings-row__control">
            <Button danger icon={<RotateCcw size={14} />} onClick={handleReset}>
              Сбросить
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
