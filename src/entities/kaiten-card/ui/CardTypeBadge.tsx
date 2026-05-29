import type { ReactElement } from 'react';
import { Tag, Tooltip } from 'antd';
import { Bug, Code, MoreHorizontal } from 'lucide-react';
import type { KaitenCardType } from '../model/types';

interface TypeMeta {
  label: string;
  color: string;
  icon: ReactElement;
}

const TYPE_META: Record<KaitenCardType, TypeMeta> = {
  DEVELOPMENT: {
    label: 'Разработка',
    color: 'processing',
    icon: <Code size={11} strokeWidth={2} />,
  },
  DEFECT: {
    label: 'Дефект',
    color: 'error',
    icon: <Bug size={11} strokeWidth={2} />,
  },
  OTHER: {
    label: 'Прочее',
    color: 'default',
    icon: <MoreHorizontal size={11} strokeWidth={2} />,
  },
};

interface CardTypeBadgeProps {
  cardType: KaitenCardType;
  /** В iconOnly-режиме показывается только иконка, label — в tooltip. */
  iconOnly?: boolean;
}

export function CardTypeBadge({ cardType, iconOnly = false }: CardTypeBadgeProps) {
  const meta = TYPE_META[cardType];

  const tag = (
    <Tag color={meta.color} bordered={false} style={{ margin: 0, fontSize: 11 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {meta.icon}
        {!iconOnly && <span>{meta.label}</span>}
      </span>
    </Tag>
  );

  if (iconOnly) {
    return (
      <Tooltip title={meta.label} mouseEnterDelay={0.3}>
        {tag}
      </Tooltip>
    );
  }
  return tag;
}
