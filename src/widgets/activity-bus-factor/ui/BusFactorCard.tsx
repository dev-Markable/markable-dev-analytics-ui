import { useMemo } from 'react';
import { Card, Progress, Tag, Typography } from 'antd';
import { ShieldAlert } from 'lucide-react';
import type { DailyStat } from '@/entities/stats';
import { EmptyState } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/lib';
import { aggregateBusFactor, type RepoBusFactor } from '../lib/aggregate-bus-factor';
import { RiskBadge } from './RiskBadge';

interface BusFactorCardProps {
  daily: readonly DailyStat[];
}

const SHARE_TONE = (share: number): string =>
  share >= 0.7 ? 'var(--ant-color-error)' : share >= 0.5 ? 'var(--ant-color-warning)' : 'var(--ant-color-success)';

function Row({ item }: { item: RepoBusFactor }) {
  return (
    <div className="bus-factor__row">
      <div className="bus-factor__repo">
        <Tag bordered={false} className="bus-factor__repo-tag">
          {item.repo}
        </Tag>
        <Typography.Text type="secondary" className="bus-factor__meta">
          {formatNumber(item.totalCommits)} коммитов · {item.authorCount}{' '}
          {item.authorCount === 1 ? 'автор' : 'авторов'}
        </Typography.Text>
      </div>

      <div className="bus-factor__share">
        <div className="bus-factor__share-head">
          <Typography.Text type="secondary" className="bus-factor__share-label">
            топ-контрибьютор
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: 13 }}>
            {formatPercent(item.topAuthorShare * 100, 0)}
          </Typography.Text>
        </div>
        <Progress
          percent={Math.round(item.topAuthorShare * 100)}
          showInfo={false}
          size="small"
          strokeColor={SHARE_TONE(item.topAuthorShare)}
        />
      </div>

      <RiskBadge level={item.riskLevel} busFactor={item.busFactor} />
    </div>
  );
}

export function BusFactorCard({ daily }: BusFactorCardProps) {
  const items = useMemo(() => aggregateBusFactor(daily), [daily]);
  const atRisk = items.filter((i) => i.riskLevel === 'high').length;

  return (
    <Card variant="borderless" className="leaderboard-card">
      <header className="leaderboard-card__header">
        <div className="leaderboard-card__title">
          <span className="leaderboard-card__icon">
            <ShieldAlert size={16} />
          </span>
          <Typography.Title level={4} className="leaderboard-card__title-text">
            Bus factor по репозиториям
          </Typography.Title>
        </div>
        <Typography.Text type="secondary" className="leaderboard-card__description">
          {atRisk > 0
            ? `${atRisk} ${atRisk === 1 ? 'репозиторий' : 'репозиториев'} с концентрацией знаний в одних руках`
            : 'Сколько людей нужно «потерять», чтобы знания о репо исчезли'}
        </Typography.Text>
      </header>

      <div className="leaderboard-card__body">
        {items.length === 0 ? (
          <EmptyState
            title="Нет данных"
            description="За выбранный период коммитов по репозиториям нет."
          />
        ) : (
          <div className="bus-factor">
            {items.map((item) => (
              <Row key={item.repo} item={item} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
