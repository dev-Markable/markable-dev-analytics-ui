import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Input } from 'antd';
import { Search, CornerDownLeft } from 'lucide-react';
import { UserAvatar } from '@/entities/user';
import { useCommandPalette } from '../model/store';
import { useCommands } from '../lib/use-commands';
import { matchCommands, type Command } from '../lib/match';

/**
 * Командная палитра (Cmd/Ctrl-K): глобальный поиск-навигация по страницам,
 * периодам, командам и разработчикам. Монтируется один раз в AppLayout.
 */
export function CommandPalette() {
  const open = useCommandPalette((s) => s.open);
  const setOpen = useCommandPalette((s) => s.setOpen);
  const toggle = useCommandPalette((s) => s.toggle);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useCommands(open);
  const matched = useMemo(() => matchCommands(commands, query), [commands, query]);

  // Глобальный хоткей. capture, чтобы перехватить раньше инпутов страницы.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [toggle]);

  // Сброс при каждом открытии.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  // Активный индекс не должен вылезать за пределы отфильтрованного списка.
  useEffect(() => setActive(0), [query]);

  // Подскролл активного пункта в зону видимости.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const close = () => setOpen(false);
  const runAt = (i: number) => {
    const cmd = matched[i];
    if (!cmd) return;
    close();
    cmd.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, matched.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(active);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      closable={false}
      destroyOnClose
      width={560}
      styles={{ body: { padding: 0 } }}
      className="command-palette"
      maskClosable
    >
      <div className="command-palette__search">
        <Search size={18} className="command-palette__search-icon" />
        <Input
          variant="borderless"
          autoFocus
          placeholder="Поиск страниц, команд, разработчиков…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <kbd className="command-palette__kbd">esc</kbd>
      </div>

      <div className="command-palette__list" ref={listRef}>
        {matched.length === 0 ? (
          <div className="command-palette__empty">Ничего не найдено</div>
        ) : (
          matched.map((cmd, i) => {
            const prev = matched[i - 1];
            const showHeader = !prev || prev.group !== cmd.group;
            return (
              <CommandRow
                key={cmd.id}
                cmd={cmd}
                index={i}
                active={i === active}
                header={showHeader ? cmd.group : null}
                onHover={() => setActive(i)}
                onRun={() => runAt(i)}
              />
            );
          })
        )}
      </div>
    </Modal>
  );
}

interface CommandRowProps {
  cmd: Command;
  index: number;
  active: boolean;
  header: string | null;
  onHover: () => void;
  onRun: () => void;
}

function CommandRow({ cmd, index, active, header, onHover, onRun }: CommandRowProps) {
  const Icon = cmd.icon;
  return (
    <>
      {header && <div className="command-palette__group">{header}</div>}
      <button
        type="button"
        data-idx={index}
        className={`command-palette__item${active ? ' command-palette__item--active' : ''}`}
        onMouseMove={onHover}
        onClick={onRun}
      >
        <span className="command-palette__item-icon">
          {cmd.user ? (
            <UserAvatar user={cmd.user} size={22} isLead={cmd.user.isLead} />
          ) : (
            Icon && <Icon size={16} />
          )}
        </span>
        <span className="command-palette__item-label">{cmd.label}</span>
        {cmd.hint && <span className="command-palette__item-hint">{cmd.hint}</span>}
        {active && <CornerDownLeft size={14} className="command-palette__item-enter" />}
      </button>
    </>
  );
}
