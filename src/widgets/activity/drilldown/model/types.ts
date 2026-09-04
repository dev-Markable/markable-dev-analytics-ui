/** Пара «подпись → значение» для строки drill-down (коммиты, строки, метрика). */
export interface DrillStat {
  label: string;
  value: string;
}

/** Одна строка разбивки: разработчик + его показатели в выбранном срезе. */
export interface DrillRow {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  team: string | null;
  isLead: boolean;
  stats: DrillStat[];
}

/**
 * Крупная цифра среза с пояснением — для срезов, где разбивки по людям нет.
 *
 * Почасовая сетка такой случай: HourlyCell в контракте держит только
 * (weekday, hour, commits, addedLines), автора в ней нет и собрать список
 * разработчиков неоткуда. Вместо пустой панели показываем то, что из этих
 * данных действительно выводится — вес ячейки в периоде и её место в неделе.
 */
export interface DrillHighlight {
  label: string;
  value: string;
  hint?: string;
}

/** Готовое содержимое drill-down. Виджеты собирают его и отдают наверх. */
export interface DrillContent {
  title: string;
  subtitle?: string;
  /** Разбивка по людям. Пустая, если срез её не поддерживает. */
  rows: DrillRow[];
  /** Цифры среза — показываются над списком или вместо него. */
  highlights?: DrillHighlight[];
}

/** Минимум enrichment'а для daily-срезов (в daily есть только email). */
export interface DrillEnrichment {
  displayName: string | null;
  avatarUrl: string | null;
  team: string | null;
  isLead: boolean;
}
