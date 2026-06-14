import { Tooltip } from 'antd';
import { Grid3x3 } from 'lucide-react';
import type { CohortRetention } from '@/entities/cohort';
import { AsyncContent, EmptyState, SectionCard } from '@/shared/ui';
import type { AsyncState } from '@/shared/api';

interface RetentionTriangleProps {
  state: AsyncState<CohortRetention>;
  onRetry?: () => void;
}

const cellBg = (v: number): string =>
  `color-mix(in srgb, var(--ant-color-primary) ${Math.round(v * 100)}%, transparent)`;

/**
 * Retention-треугольник: строки — когорты по месяцу первой активности, колонки —
 * смещение k месяцев, значение — доля когорты, активной в месяце старт+k.
 * Чем темнее по строке вправо, тем лучше держится когорта.
 */
export function RetentionTriangle({ state, onRetry }: RetentionTriangleProps) {
  const cohorts = state.data?.cohorts ?? [];
  const maxLen = cohorts.reduce((m, c) => Math.max(m, c.retention.length), 0);
  const offsets = Array.from({ length: maxLen }, (_, i) => i);
  const devCount = cohorts.reduce((s, c) => s + c.size, 0);

  return (
    <SectionCard
      title="Удержание по когортам"
      icon={<Grid3x3 size={16} />}
      description={
        cohorts.length > 0
          ? `${cohorts.length} когорт · ${devCount} разработчиков · когорта = месяц первой активности`
          : 'Когорта = месяц первой активности · доля активных через k месяцев'
      }
    >
      <AsyncContent
        status={state.status}
        isEmpty={cohorts.length === 0}
        error={state.error}
        onRetry={onRetry}
        skeleton={<div className="cohort-skeleton" />}
        empty={<EmptyState title="Нет данных" description="Когорт за историю не найдено." />}
      >
        <div className="retention">
          <div
            className="retention__grid"
            style={{ gridTemplateColumns: `132px repeat(${maxLen}, 40px)` }}
          >
            <div className="retention__corner">Когорта</div>
            {offsets.map((k) => (
              <div key={k} className="retention__colhead">
                +{k}
              </div>
            ))}

            {cohorts.map((c) => (
              <div className="retention__row" key={c.cohort} style={{ display: 'contents' }}>
                <div className="retention__rowhead">
                  <span className="retention__cohort">{c.cohort}</span>
                  <span className="retention__size">{c.size}</span>
                </div>
                {offsets.map((k) => {
                  const v = c.retention[k];
                  if (v == null) return <div key={k} className="retention__cell retention__cell--void" />;
                  return (
                    <Tooltip
                      key={k}
                      title={`${c.cohort} · +${k} мес: ${Math.round(v * 100)}% из ${c.size}`}
                    >
                      <div
                        className={`retention__cell${v >= 0.6 ? ' retention__cell--strong' : ''}`}
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
          <div className="retention__legend">Значения — % от размера когорты · колонки — месяцев с старта</div>
        </div>
      </AsyncContent>
    </SectionCard>
  );
}
