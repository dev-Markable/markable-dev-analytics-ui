import type { ReactNode } from 'react';
import { Button, Typography } from 'antd';

/**
 * «Флатлайн» — на-theme иллюстрация пустого состояния: линия пульса, которая
 * сошла на нет. Для продукта про активность это честнее «ящика входящих»:
 * не «данные куда-то положили и потеряли», а «за период ничего не произошло».
 * Нейтрально, без драмы — ноль в данных не ошибка.
 */
function PulseFlatline() {
  return (
    <svg
      width="64"
      height="28"
      viewBox="0 0 64 28"
      fill="none"
      aria-hidden
      className="state-block__flatline"
    >
      <path
        d="M2 20 H16 L21 8 L26 26 L31 14 L36 20 H44"
        stroke="var(--ant-color-text-quaternary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 20 H62"
        stroke="var(--ant-color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  title = 'Нет данных',
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="state-block">
      <div className="state-block__icon state-block__icon--muted">
        {icon ?? <PulseFlatline />}
      </div>
      <Typography.Title level={4} className="state-block__title">
        {title}
      </Typography.Title>
      {description && (
        <Typography.Text type="secondary" className="state-block__description">
          {description}
        </Typography.Text>
      )}
      {action && (
        <Button onClick={action.onClick} className="state-block__action">
          {action.label}
        </Button>
      )}
    </div>
  );
}
