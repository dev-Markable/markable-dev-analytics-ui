export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

const SEP = ';'; // ru-Excel по умолчанию ждёт `;` как разделитель
const BOM = '﻿'; // чтобы Excel распознал UTF-8 и не сломал кириллицу

/**
 * Экранирует значение для CSV-ячейки: оборачивает в кавычки, если внутри
 * есть разделитель / кавычка / перенос строки; внутренние кавычки удваивает.
 */
export function escapeCsvCell(raw: string | number | null | undefined): string {
  if (raw == null) return '';
  const s = String(raw);
  if (s.includes(SEP) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Собирает CSV-строку из строк данных и описания колонок.
 * Без BOM — чистый текст (BOM добавляется при скачивании).
 */
export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(SEP);
  const body = rows.map((row) =>
    columns.map((c) => escapeCsvCell(c.value(row))).join(SEP),
  );
  return [header, ...body].join('\r\n');
}

/** Скачивает текстовый контент как файл (через Blob + временный <a>). */
export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Собирает CSV и сразу скачивает его (с BOM для Excel). */
export function downloadCsv<T>(
  filename: string,
  rows: readonly T[],
  columns: readonly CsvColumn<T>[],
): void {
  const csv = BOM + toCsv(rows, columns);
  downloadText(filename, csv, 'text/csv;charset=utf-8');
}
