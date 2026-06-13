import { useMemo } from 'react';
import { Tag, Tooltip } from 'antd';
import { AlertTriangle, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import type { ReviewAuthor, ReviewStats } from '@/entities/stats';
import { useTeamScopeFilter } from '@/features/team-scope';
import { AsyncContent, EmptyState, SectionCard } from '@/shared/ui';
import { formatPercent } from '@/shared/lib';
import type { AsyncState } from '@/shared/api';
import { computeConcentration, type RiskLevel } from '../lib/concentration';
import { LorenzChart } from './LorenzChart';

interface ReviewConcentrationCardProps {
  state: AsyncState<ReviewStats>;
  onRetry?: () => void;
}

const RISK_META: Record<RiskLevel, { label: string; color: string; icon: typeof AlertTriangle }> = {
  high: { label: 'держится на одном', color: 'error', icon: AlertTriangle },
  medium: { label: 'на двоих', color: 'warning', icon: ShieldAlert },
  low: { label: 'распределено', color: 'success', icon: ShieldCheck },
};

function RiskPill({ level, busFactor }: { level: RiskLevel; busFactor: number }) {
  const meta = RISK_META[level];
  const Icon = meta.icon;
  return (
    <Tag color={meta.color} bordered={false} className="risk-badge">
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Icon size={12} strokeWidth={2} />
        BF {busFactor} · {meta.label}
      </span>
    </Tag>
  );
}

/**
 * Концентрация ревью — ревью-аналог bus factor для кода. Отвечает на вопрос
 * «устоит ли ревью, если уйдёт один человек»: сколько ревьюеров покрывают >50%
 * approve, насколько неравномерно распределён груз (Gini + кривая Лоренца).
 * Per-person цифры живёт в таблице «Ревью» — здесь только командная картина.
 */
export function ReviewConcentrationCard({ state, onRetry }: ReviewConcentrationCardProps) {
  const authors = state.data?.authors ?? [];
  const scoped = useTeamScopeFilter<ReviewAuthor>(authors, (a) => a.team);
  const stats = useMemo(() => computeConcentration(scoped), [scoped]);

  return (
    <SectionCard
      title="Концентрация ревью"
      icon={<Users size={16} />}
      description="Насколько ревью держится на немногих · approve к чужим MR"
      actions={stats && <RiskPill level={stats.riskLevel} busFactor={stats.busFactor} />}
    >
      <AsyncContent
        status={state.status}
        isEmpty={stats === null}
        hasData={authors.length > 0}
        error={state.error}
        onRetry={onRetry}
        skeleton={<div className="concentration-skeleton" />}
        empty={
          <EmptyState
            title="Нет ревью-активности"
            description="За выбранный период approve'ов к чужим MR не зафиксировано."
          />
        }
      >
        {stats && (
          <div className="concentration-body">
            <div className="concentration-tiles">
              <Tooltip title="Минимум ревьюеров, чьи approve дают больше половины. 1 — весь груз на одном.">
                <div className="concentration-tile">
                  <span className="concentration-tile__label">Review bus factor</span>
                  <span className="concentration-tile__value">{stats.busFactor}</span>
                  <span className="concentration-tile__sub">из {stats.activeReviewers} активных</span>
                </div>
              </Tooltip>
              <Tooltip title="Доля всех approve, приходящаяся на трёх самых активных ревьюеров.">
                <div className="concentration-tile">
                  <span className="concentration-tile__label">Топ-3 ревьюера</span>
                  <span className="concentration-tile__value">
                    {formatPercent(stats.top3Share * 100)}
                  </span>
                  <span className="concentration-tile__sub">от всех approve</span>
                </div>
              </Tooltip>
              <Tooltip title="Доля approve у самого активного ревьюера.">
                <div className="concentration-tile">
                  <span className="concentration-tile__label">Топ-1 ревьюер</span>
                  <span className="concentration-tile__value">
                    {formatPercent(stats.topShareValue * 100)}
                  </span>
                  <span className="concentration-tile__sub">от всех approve</span>
                </div>
              </Tooltip>
            </div>
            <LorenzChart points={stats.lorenz} gini={stats.gini} />
          </div>
        )}
      </AsyncContent>
    </SectionCard>
  );
}
