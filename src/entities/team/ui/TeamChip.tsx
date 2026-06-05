import { Tooltip } from 'antd';
import { Users } from 'lucide-react';

interface TeamChipProps {
  team: string | null | undefined;
  /** Компактный режим — без иконки, поменьше паддинг. */
  compact?: boolean;
  /** Что показывать при отсутствии команды: компонент-тег или null. */
  showEmpty?: boolean;
}

/**
 * Маленький тэг с именем команды. При `team = null` либо ничего не рендерит,
 * либо рисует «без команды» (если `showEmpty=true`).
 */
export function TeamChip({ team, compact = false, showEmpty = false }: TeamChipProps) {
  if (!team) {
    if (!showEmpty) return null;
    return (
      <span className={`team-chip team-chip--empty${compact ? ' team-chip--compact' : ''}`}>
        без команды
      </span>
    );
  }

  return (
    <Tooltip title={`Команда: ${team}`}>
      <span className={`team-chip${compact ? ' team-chip--compact' : ''}`}>
        {!compact && <Users size={11} strokeWidth={2.5} />}
        <span className="team-chip__name">{team}</span>
      </span>
    </Tooltip>
  );
}
