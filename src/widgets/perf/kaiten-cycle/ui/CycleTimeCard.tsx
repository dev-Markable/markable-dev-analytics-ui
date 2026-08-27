import { Bug, Code, Timer } from 'lucide-react';
import type { CycleTimeBreakdown } from '@/entities/performance-review';
import { EmptyState, SectionCard } from '@/shared/ui';
import { CycleTimeSection } from './CycleTimeSection';

interface CycleTimeCardProps {
  cycle: CycleTimeBreakdown;
}

export function CycleTimeCard({ cycle }: CycleTimeCardProps) {
  const { defects, development } = cycle;
  const isEmpty = defects.count === 0 && development.count === 0;

  return (
    <SectionCard
      title="Cycle-time"
      icon={<Timer size={16} />}
      description="От первого перехода «в работу» до «готово». Дефекты и разработка считаются раздельно — длительность у них разная"
    >
      {isEmpty ? (
        <EmptyState
          title="Нет закрытых карточек"
          description="За период ни одна карточка не дошла до «готово»."
        />
      ) : (
        <div className="cycle-time">
          <CycleTimeSection title="Дефекты" icon={<Bug size={14} />} cycle={defects} />
          <CycleTimeSection title="Разработка" icon={<Code size={14} />} cycle={development} />
        </div>
      )}
    </SectionCard>
  );
}
