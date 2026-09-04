import { ExternalLink, Flame } from 'lucide-react';
import type { FirefightingItem } from '@/entities/performance-review';
import { URGENCY_META } from '../config/urgency-meta';
import { EmptyState, SectionCard } from '@/shared/ui';

interface FirefightingCardProps {
  items: FirefightingItem[];
}

export function FirefightingCard({ items }: FirefightingCardProps) {
  return (
    <SectionCard
      title="Тушение пожаров"
      icon={<Flame size={16} />}
      description="Закрытые критичные и высокие дефекты — пруфы, что фиксил «горящее»"
    >
      {items.length === 0 ? (
        <EmptyState title="Пожаров не тушил" description="За период не закрывал критичных и высоких дефектов." />
      ) : (
        <ul className="notable-list">
            {items.map((item) => {
              const meta = URGENCY_META[item.urgency];
              const content = (
                <>
                  <span
                    className="notable-list__urgency"
                    style={{ background: meta.color }}
                    title={`Срочность: ${meta.label}`}
                  >
                    {meta.label}
                  </span>
                  <span className="notable-list__text">
                    <span className="notable-list__title">{item.title}</span>
                    <span className="notable-list__sub">#{item.id}</span>
                  </span>
                  {item.url && (
                    <ExternalLink size={14} className="notable-list__icon" />
                  )}
                </>
              );

              return (
                <li key={item.id} className="notable-list__item">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="notable-list__link"
                    >
                      {content}
                    </a>
                  ) : (
                    <span className="notable-list__link notable-list__link--inert">
                      {content}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
      )}
    </SectionCard>
  );
}
