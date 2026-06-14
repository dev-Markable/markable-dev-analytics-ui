import { Tooltip } from 'antd';
import { Shuffle } from 'lucide-react';
import type { ActivityTier, TierTransitions } from '@/entities/cohort';
import { AsyncContent, EmptyState, SectionCard } from '@/shared/ui';
import type { AsyncState } from '@/shared/api';

interface TierTransitionMatrixProps {
  state: AsyncState<TierTransitions>;
  onRetry?: () => void;
}

const TIER_LABEL: Record<ActivityTier, string> = {
  INACTIVE: 'Неактивен',
  BELOW_AVERAGE: 'Ниже среднего',
  ACTIVE: 'Активен',
  STAR: 'Топ',
};

const cellBg = (v: number): string =>
  `color-mix(in srgb, var(--ant-color-primary) ${Math.round(v * 100)}%, transparent)`;

/**
 * 4×4 матрица переходов тиров активности месяц-к-месяцу. Строки — откуда, колонки
 * — куда; значение — доля (сумма строки = 1). Диагональ = «остался в тире».
 */
export function TierTransitionMatrix({ state, onRetry }: TierTransitionMatrixProps) {
  const tiers = state.data?.tiers ?? [];
  const matrix = state.data?.matrix ?? [];

  return (
    <SectionCard
      title="Переходы уровней"
      icon={<Shuffle size={16} />}
      description="Куда уходят из тира месяц-к-месяцу · строки нормированы"
    >
      <AsyncContent
        status={state.status}
        isEmpty={tiers.length === 0 || matrix.length === 0}
        error={state.error}
        onRetry={onRetry}
        skeleton={<div className="cohort-skeleton" />}
        empty={<EmptyState title="Нет данных" description="Переходов за историю не найдено." />}
      >
        <div className="tiers">
          <div
            className="tiers__grid"
            style={{ gridTemplateColumns: `120px repeat(${tiers.length}, 1fr)` }}
          >
            <div className="tiers__corner">из → в</div>
            {tiers.map((t) => (
              <div key={t} className="tiers__colhead">
                {TIER_LABEL[t]}
              </div>
            ))}

            {tiers.map((from, i) => (
              <div key={from} style={{ display: 'contents' }}>
                <div className="tiers__rowhead">{TIER_LABEL[from]}</div>
                {tiers.map((to, j) => {
                  const v = matrix[i]?.[j] ?? 0;
                  return (
                    <Tooltip
                      key={to}
                      title={`${TIER_LABEL[from]} → ${TIER_LABEL[to]}: ${Math.round(v * 100)}%`}
                    >
                      <div
                        className={`tiers__cell${i === j ? ' tiers__cell--diag' : ''}${
                          v >= 0.6 ? ' tiers__cell--strong' : ''
                        }`}
                        style={{ background: cellBg(v) }}
                      >
                        {Math.round(v * 100)}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </AsyncContent>
    </SectionCard>
  );
}
