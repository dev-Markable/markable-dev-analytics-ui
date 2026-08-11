import type { ReactNode } from 'react';
import './styles.css';

interface SectionTitleProps {
  children: ReactNode;
  /** Пояснение справа — чем этот раздел отличается от соседних. */
  hint?: ReactNode;
}

/**
 * Заголовок смысловой группы блоков внутри страницы.
 *
 * Нужен там, где секций много и они равнозначны по весу: без группировки
 * страница читается как непрерывный поток карточек без структуры.
 */
export function SectionTitle({ children, hint }: SectionTitleProps) {
  return (
    <div className="section-title">
      <h2 className="section-title__text">{children}</h2>
      {hint && <span className="section-title__hint">{hint}</span>}
      <span className="section-title__rule" aria-hidden />
    </div>
  );
}
