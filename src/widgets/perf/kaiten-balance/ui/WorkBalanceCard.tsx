import { Scale } from 'lucide-react';
import type { WorkBalance } from '@/entities/performance-review';
import { formatNumber } from '@/shared/lib';
import { RatioBar, SectionCard } from '@/shared/ui';

interface WorkBalanceCardProps {
  balance: WorkBalance;
}

export function WorkBalanceCard({ balance }: WorkBalanceCardProps) {
  const { defectCount, buildCount, defectShare } = balance;
  // Больше половины карточек — дефекты: повод для разговора, а не приговор.
  const firefighting = defectShare > 0.5;

  return (
    <SectionCard
      title="Баланс работы"
      icon={<Scale size={16} />}
      description="Firefighting (дефекты) vs building (разработка и задачи) по карточкам периода"
    >
      <div className="perf-card">
        <RatioBar
          segments={[
            {
              key: 'defects',
              label: `Дефекты — ${formatNumber(defectCount)}`,
              value: defectCount,
              tone: firefighting ? 'error' : 'warning',
            },
            {
              key: 'build',
              label: `Разработка — ${formatNumber(buildCount)}`,
              value: buildCount,
              tone: 'primary',
            },
          ]}
          emptyText="За период нет карточек — нечего показывать"
        />

        {defectCount + buildCount > 0 && (
          <p className={`work-balance__verdict${firefighting ? ' work-balance__verdict--hot' : ''}`}>
            {firefighting
              ? 'Преимущественно тушит пожары — стоит обсудить причины.'
              : 'Баланс в сторону разработки.'}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
