import { useMemo, useRef, useState } from 'react';
import { Input, Segmented } from 'antd';
import { Search, Users } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { CohortActivityMatrix } from '@/entities/cohort';
import { AsyncContent, EmptyState, SectionCard } from '@/shared/ui';
import { useDebouncedValue } from '@/shared/hooks';
import type { AsyncState } from '@/shared/api';
import type { DateRange } from '@/shared/lib';
import { filterDevelopers, sortDevelopers, type MatrixSort } from '../lib/sort';
import { MatrixRow } from './MatrixRow';

interface ActivityMatrixProps {
  state: AsyncState<CohortActivityMatrix>;
  range?: DateRange;
  onRetry?: () => void;
}

const NAME_COL = 248;
const CELL = 18;
const ROW_H = 44;

const SORT_OPTIONS = [
  { value: 'tenure', label: 'По стажу' },
  { value: 'activity', label: 'По активности' },
  { value: 'team', label: 'По команде' },
];

export function ActivityMatrix({ state, range, onRetry }: ActivityMatrixProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<MatrixSort>('tenure');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);

  const months = state.data?.months ?? [];
  const developers = useMemo(() => state.data?.developers ?? [], [state.data]);

  const max = useMemo(() => {
    let m = 0;
    for (const d of developers) for (const c of d.cells) if (c > m) m = c;
    return m;
  }, [developers]);

  const rows = useMemo(
    () => sortDevelopers(filterDevelopers(developers, debounced), sort),
    [developers, debounced, sort],
  );

  const template = `${NAME_COL}px repeat(${months.length}, ${CELL}px)`;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_H,
    overscan: 12,
  });

  return (
    <SectionCard
      title="Активность всех разработчиков"
      icon={<Users size={16} />}
      description="Строка — разработчик, колонка — месяц, цвет — коммиты (лог-шкала)"
      actions={
        <Segmented
          value={sort}
          onChange={(v) => setSort(v as MatrixSort)}
          options={SORT_OPTIONS}
        />
      }
    >
      <AsyncContent
        status={state.status}
        isEmpty={developers.length === 0}
        error={state.error}
        onRetry={onRetry}
        skeleton={<div className="cohort-skeleton" />}
        empty={<EmptyState title="Нет данных" description="Активности за историю не найдено." />}
      >
        <div className="matrix">
          <Input
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, email, команде…"
            prefix={<Search size={15} />}
            className="matrix__search"
          />

          <div className="matrix__scroll" ref={parentRef}>
            <div className="matrix__header" style={{ gridTemplateColumns: template }}>
              <div className="matrix__corner">{rows.length} разработчиков</div>
              {months.map((m) => (
                <div key={m} className="matrix__monthtick">
                  {m.endsWith('-01') ? m.slice(0, 4) : ''}
                </div>
              ))}
            </div>

            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
              {virtualizer.getVirtualItems().map((v) => {
                const dev = rows[v.index];
                if (!dev) return null;
                return (
                  <div
                    key={dev.email}
                    style={{ position: 'absolute', top: 0, left: 0, transform: `translateY(${v.start}px)` }}
                  >
                    <MatrixRow dev={dev} months={months} max={max} template={template} range={range} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AsyncContent>
    </SectionCard>
  );
}
