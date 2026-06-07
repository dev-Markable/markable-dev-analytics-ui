import { Card, Typography } from 'antd';
import { Scale } from 'lucide-react';
import type { WorkBalance } from '@/entities/performance-review';
import { formatNumber } from '@/shared/lib';

interface WorkBalanceCardProps {
  balance: WorkBalance;
}

function formatShare(value: number): string {
  const pct = Math.round(value * 100);
  return `${pct}%`;
}

export function WorkBalanceCard({ balance }: WorkBalanceCardProps) {
  const { defectCount, buildCount, defectShare, buildShare } = balance;
  const total = defectCount + buildCount;
  const isEmpty = total === 0;
  // Тон шапки: если firefighting > 50% — это сигнал, делаем строгим.
  const firefighting = defectShare > 0.5;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <Scale size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Баланс работы
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          Firefighting (дефекты) vs building (разработка + задачи) по карточкам периода.
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {isEmpty ? (
          <Typography.Text type="secondary">
            За период нет карточек — нечего показывать.
          </Typography.Text>
        ) : (
          <>
            <div
              className={`work-balance__bar${firefighting ? ' work-balance__bar--hot' : ''}`}
              role="img"
              aria-label={`Дефекты ${formatShare(defectShare)}, разработка ${formatShare(buildShare)}`}
            >
              {defectShare > 0 && (
                <span
                  className="work-balance__seg work-balance__seg--defect"
                  style={{ width: `${defectShare * 100}%` }}
                >
                  {defectShare >= 0.12 && formatShare(defectShare)}
                </span>
              )}
              {buildShare > 0 && (
                <span
                  className="work-balance__seg work-balance__seg--build"
                  style={{ width: `${buildShare * 100}%` }}
                >
                  {buildShare >= 0.12 && formatShare(buildShare)}
                </span>
              )}
            </div>

            <div className="work-balance__legend">
              <span className="work-balance__legend-item">
                <i className="work-balance__legend-dot work-balance__legend-dot--defect" />
                Дефекты — {formatNumber(defectCount)}
              </span>
              <span className="work-balance__legend-item">
                <i className="work-balance__legend-dot work-balance__legend-dot--build" />
                Разработка — {formatNumber(buildCount)}
              </span>
            </div>

            {firefighting && (
              <Typography.Text type="warning" className="work-balance__note">
                Преимущественно тушит пожары — стоит обсудить причины.
              </Typography.Text>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
