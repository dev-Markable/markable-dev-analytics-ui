import { Card, Segmented, Typography } from 'antd';
import { Palette } from 'lucide-react';
import { ThemeSwitch, useThemeStore, type Density } from '@/features/theme-switch';

const DESCRIPTIONS: Record<'light' | 'dark' | 'system', string> = {
  light: 'Светлая тема — для офиса и яркого света',
  dark: 'Тёмная тема — для долгих сессий и приглушённого света',
  system: 'Автоматически переключается под настройку ОС',
};

const DENSITY_LABELS: Record<Density, string> = {
  comfortable: 'свободно',
  compact: 'компактно',
};

export function AppearanceCard() {
  const preference = useThemeStore((s) => s.preference);
  const density = useThemeStore((s) => s.density);
  const setDensity = useThemeStore((s) => s.setDensity);

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Palette size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Внешний вид
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Тема оформления и плотность таблиц
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <div className="settings-row">
          <div className="settings-row__main">
            <Typography.Text strong style={{ fontSize: 14 }}>
              Тема
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {DESCRIPTIONS[preference]}
            </Typography.Text>
          </div>
          <div className="settings-row__control">
            <ThemeSwitch />
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-row">
          <div className="settings-row__main">
            <Typography.Text strong style={{ fontSize: 14 }}>
              Плотность таблиц
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Компактно — когда сканируешь большие выборки построчно
            </Typography.Text>
          </div>
          <div className="settings-row__control">
            <Segmented
              value={density}
              onChange={(v) => setDensity(v as Density)}
              options={(Object.keys(DENSITY_LABELS) as Density[]).map((value) => ({
                value,
                label: DENSITY_LABELS[value],
              }))}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
