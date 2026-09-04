import { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { TimesheetDay } from '@/entities/stats';
import { dayjs } from '@/shared/lib';
import { formatHours, maxMinutes } from '../lib/hours';
import { typeMeta } from '../lib/type-meta';
import { DayEntries } from './DayEntries';

interface TimesheetDaysProps {
  days: TimesheetDay[];
}

/**
 * Список дней таймшита. Строка дня: дата · сегментированный бар (доля времени по типам задач)
 * · часы. Клик раскрывает детализацию — на что ушло время.
 *
 * Обычный список вместо таблицы: у дня своя визуальная иерархия (крупная дата, бар, часы),
 * а вложенная таблица в раскрытой строке читалась как дамп данных.
 */
export function TimesheetDays({ days }: TimesheetDaysProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const max = useMemo(() => maxMinutes(days), [days]);

  const toggle = (date: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });

  return (
    <div className="ts-days">
      {days.map((day) => (
        <DayRow
          key={day.date}
          day={day}
          max={max}
          open={open.has(day.date)}
          onToggle={() => toggle(day.date)}
        />
      ))}
    </div>
  );
}

interface DayRowProps {
  day: TimesheetDay;
  max: number;
  open: boolean;
  onToggle: () => void;
}

function DayRow({ day, max, open, onToggle }: DayRowProps) {
  const d = dayjs(day.date);
  const weekend = [0, 6].includes(d.day());
  // «1 июня», а не «1 июнь»: родительный падеж ru-локаль даёт только в связке с днём,
  // поэтому форматируем целиком и разбиваем строку — визуальная иерархия сохраняется.
  const [dayNum = d.format('D'), ...monthParts] = d.format('D MMMM').split(' ');
  const monthName = monthParts.join(' ');
  const expandable = day.entries.length > 0;

  // Сегменты бара: минуты по типам задач, ширина — относительно самого длинного дня периода.
  const segments = useMemo(() => {
    const byMod = new Map<string, number>();
    for (const e of day.entries) {
      const mod = typeMeta(e.type).mod;
      byMod.set(mod, (byMod.get(mod) ?? 0) + e.minutes);
    }
    return [...byMod.entries()]
      .map(([mod, minutes]) => ({ mod, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .map(({ mod, minutes }) => ({ mod, pct: max > 0 ? (minutes / max) * 100 : 0 }));
  }, [day.entries, max]);

  const defects = day.entries.filter((e) => e.type === 'DEFECT').length;
  const ai = day.entries.filter((e) => e.aiAgent).length;

  return (
    <div className={`ts-day${open ? ' ts-day--open' : ''}${weekend ? ' ts-day--weekend' : ''}`}>
      <button
        type="button"
        className="ts-day__head"
        onClick={expandable ? onToggle : undefined}
        aria-expanded={open}
        disabled={!expandable}
      >
        <span className="ts-day__date">
          <span className="ts-day__num">{dayNum}</span>
          <span className="ts-day__meta">
            <span className="ts-day__month">{monthName}</span>
            <span className="ts-day__weekday">{d.format('dddd')}</span>
          </span>
        </span>

        <span className="ts-bar">
          {segments.map((s) => (
            <span
              key={s.mod}
              className={`ts-bar__seg ts-bar__seg--${s.mod}`}
              style={{ width: `${s.pct}%` }}
            />
          ))}
          <span className="ts-bar__rest" />
        </span>

        <span className="ts-day__hours">
          <span className="ts-day__tags">
            {day.entries.length > 0 && `${day.entries.length} зад.`}
            {defects > 0 && ` · ${defects} деф.`}
            {ai > 0 && ` · ${ai} AI`}
          </span>
          <span className="ts-day__hours-value">{formatHours(day.minutes)}</span>
          <span className="ts-day__hours-unit">ч</span>
        </span>

        <span className="ts-day__chevron">{expandable && <ChevronRight size={16} />}</span>
      </button>

      {open && <DayEntries day={day} />}
    </div>
  );
}
