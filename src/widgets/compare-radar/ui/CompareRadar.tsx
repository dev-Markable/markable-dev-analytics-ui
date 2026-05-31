import { useMemo } from 'react';
import { Card, Typography } from 'antd';
import { Radar as RadarIcon } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { userDisplayName, type AuthorActivity } from '@/entities/user';
import { buildRadarData } from '../lib/normalize';
import { colorForIndex } from '../config/colors';

interface CompareRadarProps {
  authors: readonly AuthorActivity[];
}

export function CompareRadar({ authors }: CompareRadarProps) {
  const data = useMemo(() => buildRadarData(authors), [authors]);

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <RadarIcon size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Профиль активности
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Метрики нормализованы к лидеру по каждой оси (1.0 = максимум среди выбранных)
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="var(--ant-color-split)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fontSize: 12, fill: 'var(--ant-color-text-secondary)' }}
            />
            {authors.map((a, i) => {
              const color = colorForIndex(i);
              return (
                <Radar
                  key={a.email}
                  name={userDisplayName({ name: a.displayName ?? null, username: null, email: a.email })}
                  dataKey={a.email}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.18}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              );
            })}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
