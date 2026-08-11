import type { HourlyCellAuthor } from '@/entities/stats';
import { formatNumber, formatPercent, safeDiv } from '@/shared/lib';
import type { DrillContent, DrillEnrichment, DrillRow } from '../model/types';

export interface HourlyDrillInput {
  weekday: number;
  weekdayLabel: string;
  hour: number;
  commits: number;
  addedLines: number;
  /** Все коммиты периода — для доли ячейки. */
  totalCommits: number;
  /** Коммиты этого дня недели за период. */
  weekdayCommits: number;
  /** Коммиты этого часа по всем дням недели. */
  hourCommits: number;
  /** Место ячейки в неделе по числу коммитов, 1-based. */
  rank: number;
  /** Сколько ячеек с активностью — знаменатель места. */
  activeCells: number;
  /** Кто коммитил в этот час (HourlyCell.authors, контракт 3.12.0). */
  authors?: readonly HourlyCellAuthor[];
  /** Имена, аватары и команды по email — в ячейке только адрес. */
  enrichment?: ReadonlyMap<string, DrillEnrichment>;
}

const hh = (hour: number): string => `${String(hour).padStart(2, '0')}:00`;

/**
 * Авторы ячейки → строки разбивки, по убыванию коммитов.
 *
 * Поле `authors` опционально: ответы бэка старше 3.12.0 его не содержат, и
 * модалка тогда показывает только цифры среза. Явная сортировка здесь, а не
 * надежда на порядок с бэка — контракт обещает убывание, но полагаться на
 * порядок элементов дешевле проверить, чем отлаживать.
 */
function authorRows(
  authors: readonly HourlyCellAuthor[],
  enrichment: ReadonlyMap<string, DrillEnrichment> | undefined,
): DrillRow[] {
  return [...authors]
    .sort((a, b) => b.commits - a.commits)
    .map((a) => {
      const e = enrichment?.get(a.email.toLowerCase());
      return {
        email: a.email,
        displayName: e?.displayName ?? null,
        avatarUrl: e?.avatarUrl ?? null,
        team: e?.team ?? null,
        isLead: e?.isLead ?? false,
        stats: [
          { label: 'Коммиты', value: formatNumber(a.commits) },
          ...(a.addedLines != null
            ? [{ label: 'Строк', value: `+${formatNumber(a.addedLines)}` }]
            : []),
        ],
      };
    });
}

/**
 * Разбор ячейки почасовой сетки: кто коммитил в этот час и сколько это в
 * масштабе периода.
 *
 * До контракта 3.12.0 ячейка была анонимной агрегацией — параметры
 * `email`/`team` фильтруют выборку на входе, но автора в ответе не оставалось,
 * а в daily есть автор, но нет часа. Теперь `HourlyCell.authors` закрывает
 * этот разрыв; на старых ответах список пуст и остаются одни цифры.
 */
export function buildHourlyDrill(input: HourlyDrillInput): DrillContent {
  const shareOfPeriod = safeDiv(input.commits, input.totalCommits) * 100;
  const shareOfWeekday = safeDiv(input.commits, input.weekdayCommits) * 100;
  const shareOfHour = safeDiv(input.commits, input.hourCommits) * 100;

  const rows = input.authors?.length ? authorRows(input.authors, input.enrichment) : [];

  return {
    title: `${input.weekdayLabel}, ${hh(input.hour)}`,
    subtitle: `${formatNumber(input.commits)} не-мердж коммитов · ${input.rank}-е место из ${formatNumber(input.activeCells)} активных часов недели`,
    rows,
    highlights: [
      {
        label: 'от всех коммитов периода',
        value: formatPercent(shareOfPeriod, 1),
        hint: `${formatNumber(input.commits)} из ${formatNumber(input.totalCommits)}`,
      },
      {
        label: `от коммитов «${input.weekdayLabel}»`,
        value: formatPercent(shareOfWeekday, 0),
        hint: `весь день: ${formatNumber(input.weekdayCommits)}`,
      },
      {
        label: `от коммитов в ${hh(input.hour)}`,
        value: formatPercent(shareOfHour, 0),
        hint: `этот час за неделю: ${formatNumber(input.hourCommits)}`,
      },
      {
        label: 'строк добавлено',
        value: formatNumber(input.addedLines),
        hint:
          input.commits > 0
            ? `~${formatNumber(Math.round(safeDiv(input.addedLines, input.commits)))} на коммит`
            : undefined,
      },
    ],
  };
}
