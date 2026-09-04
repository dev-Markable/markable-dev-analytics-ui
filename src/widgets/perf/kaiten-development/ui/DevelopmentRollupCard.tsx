import { Layers } from 'lucide-react';
import type { DevelopmentRollup } from '@/entities/performance-review';
import { formatNumber } from '@/shared/lib';
import { EmptyState, SectionCard } from '@/shared/ui';
import { RootTaskRow } from './RootTaskRow';

interface DevelopmentRollupCardProps {
  rollup: DevelopmentRollup;
}

export function DevelopmentRollupCard({ rollup }: DevelopmentRollupCardProps) {
  const { useCaseCount, rootTaskCount, roots } = rollup;
  const isEmpty = useCaseCount === 0;

  return (
    <SectionCard
      title="По корневой задаче"
      icon={<Layers size={16} />}
      description={
        isEmpty
          ? 'За период нет карточек разработки или задач'
          : `${formatNumber(useCaseCount)} юскейсов в ${formatNumber(rootTaskCount)} корневых задачах`
      }
    >
      {isEmpty ? (
        <EmptyState
          title="Разработки нет"
          description="За период на этом человеке не было карточек разработки или задач."
        />
      ) : (
        <div className="root-task__list">
          {roots.map((root) => (
            <RootTaskRow
              key={root.id == null ? '__synthetic__' : String(root.id)}
              root={root}
              synthetic={root.id == null}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
