import { Search } from 'lucide-react';
import { useCommandPalette } from '../model/store';

/** Кнопка в топбаре, открывающая палитру. Дублирует хоткей Cmd/Ctrl-K. */
export function CommandTrigger() {
  const setOpen = useCommandPalette((s) => s.setOpen);
  // Mac → ⌘, остальное → Ctrl.
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <button type="button" className="command-trigger" onClick={() => setOpen(true)}>
      <Search size={15} className="command-trigger__icon" />
      <span className="command-trigger__label">Поиск</span>
      <kbd className="command-trigger__kbd">{isMac ? '⌘' : 'Ctrl'} K</kbd>
    </button>
  );
}
