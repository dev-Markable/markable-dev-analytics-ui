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

/** Готовое содержимое панели drill-down. Виджеты собирают его и отдают наверх. */
export interface DrillContent {
  title: string;
  subtitle?: string;
  rows: DrillRow[];
}

/** Минимум enrichment'а для daily-срезов (в daily есть только email). */
export interface DrillEnrichment {
  displayName: string | null;
  avatarUrl: string | null;
  team: string | null;
  isLead: boolean;
}
