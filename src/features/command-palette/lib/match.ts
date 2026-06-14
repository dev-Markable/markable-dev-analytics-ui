import type { LucideIcon } from 'lucide-react';
import type { UnifiedUser } from '@/entities/user';

export type CommandGroup = 'Навигация' | 'Период' | 'Команды' | 'Разработчики';

/** Порядок групп в выдаче — он же порядок навигации стрелками. */
export const GROUP_ORDER: readonly CommandGroup[] = [
  'Навигация',
  'Период',
  'Команды',
  'Разработчики',
];

export interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  /** Вторичная строка (email, число участников). */
  hint?: string;
  /** Доп. текст для поиска, не показывается. */
  keywords?: string;
  /** Иконка для не-пользовательских команд. */
  icon?: LucideIcon;
  /** Для группы «Разработчики» — рисуем аватар вместо иконки. */
  user?: UnifiedUser;
  run: () => void;
}

/**
 * Фильтрация команд по запросу. Регистронезависимо, по токенам (AND): каждое
 * слово запроса должно встретиться в label/hint/keywords. Порядок сохраняется —
 * команды приходят уже сгруппированными в порядке {@link GROUP_ORDER}, поэтому
 * навигация стрелками по плоскому результату совпадает с тем, что на экране.
 */
export function matchCommands(commands: readonly Command[], query: string): Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...commands];
  const tokens = q.split(/\s+/);
  return commands.filter((c) => {
    const hay = `${c.label} ${c.hint ?? ''} ${c.keywords ?? ''}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
}
