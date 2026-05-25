import { Switch, Tooltip } from 'antd';
import { Users } from 'lucide-react';
import { useTeamFilterStore } from '../model/team-filter.store';

export function TeamFilterToggle() {
  const enabled = useTeamFilterStore((s) => s.enabled);
  const toggle = useTeamFilterStore((s) => s.toggle);

  return (
    <Tooltip title="Показать только команду маркировки">
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 10px',
          borderRadius: 8,
          border: '1px solid var(--ant-color-border-secondary)',
          fontSize: 13,
          color: 'var(--ant-color-text-secondary)',
          background: 'var(--ant-color-bg-container)',
        }}
      >
        <Users size={14} />
        <span>Только команда</span>
        <Switch size="small" checked={enabled} onChange={toggle} />
      </span>
    </Tooltip>
  );
}
