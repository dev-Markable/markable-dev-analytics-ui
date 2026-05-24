import { Segmented, Tooltip } from 'antd';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useThemeStore, type ThemePreference } from '../model/theme.store';

interface Option {
  value: ThemePreference;
  icon: React.ReactNode;
  label: string;
}

const OPTIONS: readonly Option[] = [
  { value: 'light', icon: <Sun size={14} strokeWidth={2} />, label: 'Светлая' },
  { value: 'system', icon: <Monitor size={14} strokeWidth={2} />, label: 'Системная' },
  { value: 'dark', icon: <Moon size={14} strokeWidth={2} />, label: 'Тёмная' },
];

export function ThemeSwitch() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <Segmented<ThemePreference>
      size="small"
      value={preference}
      onChange={(value) => setPreference(value)}
      options={OPTIONS.map((opt) => ({
        value: opt.value,
        label: (
          <Tooltip title={opt.label} mouseEnterDelay={0.4}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
              }}
            >
              {opt.icon}
            </span>
          </Tooltip>
        ),
      }))}
    />
  );
}
