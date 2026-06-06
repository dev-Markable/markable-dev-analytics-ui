import { Card, Typography } from 'antd';
import { Flame } from 'lucide-react';
import type { DefectsSummary } from '@/entities/performance-review';
import { formatNumber } from '@/shared/lib';
import { URGENCY_SPECS } from '../config/urgency';

interface DefectsByUrgencyProps {
  defects: DefectsSummary;
}

export function DefectsByUrgency({ defects }: DefectsByUrgencyProps) {
  const { total, inWork, closed, criticalHigh, byUrgency } = defects;
  const isEmpty = total === 0;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Flame size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Дефекты по срочности
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Снапшот по карточкам Kaiten — закрытые в периоде и сейчас в работе.
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {isEmpty ? (
          <Typography.Text type="secondary">За период нет дефектов у этого человека.</Typography.Text>
        ) : (
          <>
            <div className="kaiten-defects__kpis">
              <div className="kaiten-defects__kpi kaiten-defects__kpi--hot">
                <span className="kaiten-defects__kpi-label">🔥 Горящие</span>
                <span className="kaiten-defects__kpi-value">{formatNumber(criticalHigh)}</span>
                <span className="kaiten-defects__kpi-hint">критичный + высокий</span>
              </div>
              <div className="kaiten-defects__kpi">
                <span className="kaiten-defects__kpi-label">В работе</span>
                <span className="kaiten-defects__kpi-value">{formatNumber(inWork)}</span>
              </div>
              <div className="kaiten-defects__kpi">
                <span className="kaiten-defects__kpi-label">Закрыто</span>
                <span className="kaiten-defects__kpi-value">{formatNumber(closed)}</span>
              </div>
              <div className="kaiten-defects__kpi">
                <span className="kaiten-defects__kpi-label">Всего</span>
                <span className="kaiten-defects__kpi-value">{formatNumber(total)}</span>
              </div>
            </div>

            <div
              className="kaiten-defects__bar"
              role="img"
              aria-label={`Распределение ${total} дефектов по срочности`}
            >
              {URGENCY_SPECS.map((spec) => {
                const count = byUrgency[spec.key];
                if (!count) return null;
                const pct = (count / total) * 100;
                return (
                  <span
                    key={spec.key}
                    className="kaiten-defects__seg"
                    style={{ width: `${pct}%`, background: spec.color }}
                    title={`${spec.label}: ${count}`}
                  />
                );
              })}
            </div>

            <ul className="kaiten-defects__legend">
              {URGENCY_SPECS.map((spec) => {
                const count = byUrgency[spec.key];
                if (!count) return null;
                return (
                  <li key={spec.key} className="kaiten-defects__legend-item">
                    <i style={{ background: spec.color }} />
                    <span>{spec.label}</span>
                    <strong>{formatNumber(count)}</strong>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
