import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Minus,
} from "lucide-react";

/** Положение метрики относительно команды. ±15% вокруг среднего — «на уровне». */
export type Standing = "above" | "around" | "below";

const STANDING_META: Record<
  Standing,
  { label: string; cls: string; icon: typeof ArrowUp }
> = {
  above: {
    label: "выше среднего",
    cls: "stat-tile__standing--up",
    icon: ArrowUp,
  },
  around: {
    label: "на уровне команды",
    cls: "stat-tile__standing--flat",
    icon: Minus,
  },
  below: {
    label: "ниже среднего",
    cls: "stat-tile__standing--down",
    icon: ArrowDown,
  },
};

export interface StatTileComparison {
  standing: Standing;
  /** Готовая подпись среднего — «14», «12.4%», «38 строк». Формат знает вызывающий. */
  avgLabel: string;
}

export interface StatTileDelta {
  /** Готовая подпись: «+12%», «−3 дн». Формат знает вызывающий. */
  text: string;
  /** Рост это или падение — определяет стрелку. */
  up: boolean;
  /**
   * Хорошо ли это. Отдельно от направления, потому что у времени до merge рост —
   * плохая новость, а у коммитов — хорошая.
   */
  good: boolean;
}

interface StatTileProps {
  value: ReactNode;
  label: string;
  hint?: ReactNode;
  /** Сравнение с командой. Без него плитка — просто цифра. */
  comparison?: StatTileComparison;
  /** Изменение к прошлому периоду. Взаимоисключимо с comparison по смыслу. */
  delta?: StatTileDelta;
  /** Крупный вариант — для главной цифры блока. */
  size?: "md" | "lg";
  /**
   * Где плитка стоит.
   *
   * `plain` (по умолчанию) — прямо на странице: собственный фон-контейнер, иначе
   * плитка сливается с фоном страницы и выглядит как потерянный текст.
   * `inset` — внутри SectionCard: приглушённая вставка, чтобы отделиться от
   * белого тела карточки.
   */
  variant?: "plain" | "inset";
}

/**
 * Плитка метрики: цифра, подпись, пояснение и (опционально) положение относительно
 * команды.
 *
 * Единый примитив для «Кода» и «Ревью» в профиле: раньше эти два блока стояли друг
 * под другом с разной вёрсткой плиток — ревью со своей разметкой, код через
 * MetricCard (иконка в углу, лейбл сверху). На одной странице это читалось как
 * два разных дизайна.
 *
 * Цифра без сравнения мало что сообщает: «80.8% тестового кода» — это хорошо или
 * плохо? Поэтому бейдж — часть примитива, а не украшение поверх него.
 */
export function StatTile({
  value,
  label,
  hint,
  comparison,
  delta,
  size = "md",
  variant = "plain",
}: StatTileProps) {
  const DeltaArrow = delta?.up ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={`stat-tile stat-tile--${variant}${size === "lg" ? " stat-tile--lg" : ""}`}
    >
      <div className="stat-tile__head">
        <span className="stat-tile__value display-num">{value}</span>
        {delta && (
          <span
            className={`stat-tile__delta stat-tile__delta--${delta.good ? "good" : "bad"}`}
          >
            <DeltaArrow size={12} strokeWidth={2.25} />
            {delta.text}
          </span>
        )}
        <span className="stat-tile__label">{label}</span>
      </div>
      {hint && <span className="stat-tile__hint">{hint}</span>}
      {comparison && <StandingBadge {...comparison} />}
    </div>
  );
}

function StandingBadge({ standing, avgLabel }: StatTileComparison) {
  const meta = STANDING_META[standing];
  const Icon = meta.icon;
  return (
    <span className={`stat-tile__standing ${meta.cls}`}>
      <Icon size={11} strokeWidth={2.25} />
      {meta.label}
      <span className="stat-tile__standing-avg">· ср. {avgLabel}</span>
    </span>
  );
}
