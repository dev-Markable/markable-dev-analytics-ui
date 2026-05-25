import type { ReactNode } from 'react';
import { Tooltip } from 'antd';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useThemeStore, type ThemePreference } from '../model/theme.store';

interface Option {
  value: ThemePreference;
  icon: ReactNode;
  label: string;
}

const OPTIONS: readonly Option[] = [
  { value: 'light', icon: <Sun size={15} strokeWidth={2} />, label: 'Светлая' },
  { value: 'system', icon: <Monitor size={15} strokeWidth={2} />, label: 'Системная' },
  { value: 'dark', icon: <Moon size={15} strokeWidth={2} />, label: 'Тёмная' },
];

export function ThemeSwitch() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <div className="theme-switch" role="radiogroup" aria-label="Тема оформления">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === preference;
        return (
          <Tooltip key={opt.value} title={opt.label} mouseEnterDelay={0.4}>
            <button
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={opt.label}
              className={`theme-switch__btn${isActive ? ' theme-switch__btn--active' : ''}`}
              onClick={() => setPreference(opt.value)}
            >
              {opt.icon}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
