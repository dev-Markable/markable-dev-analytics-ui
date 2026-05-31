import { describe, expect, it } from 'vitest';
import { escapeCsvCell, toCsv } from './csv';

interface Row {
  name: string;
  n: number;
}

describe('escapeCsvCell', () => {
  it('null/undefined → пустая строка', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
  });

  it('простое значение без изменений', () => {
    expect(escapeCsvCell('hello')).toBe('hello');
    expect(escapeCsvCell(42)).toBe('42');
  });

  it('оборачивает в кавычки при наличии разделителя `;`', () => {
    expect(escapeCsvCell('a;b')).toBe('"a;b"');
  });

  it('удваивает внутренние кавычки', () => {
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it('оборачивает при переносе строки', () => {
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('toCsv', () => {
  const columns = [
    { header: 'Имя', value: (r: Row) => r.name },
    { header: 'Число', value: (r: Row) => r.n },
  ];

  it('заголовок + строки, разделитель `;`, CRLF между строками', () => {
    const rows: Row[] = [
      { name: 'Boris', n: 10 },
      { name: 'Kiril', n: 5 },
    ];
    expect(toCsv(rows, columns)).toBe('Имя;Число\r\nBoris;10\r\nKiril;5');
  });

  it('пустые данные → только заголовок', () => {
    expect(toCsv([], columns)).toBe('Имя;Число');
  });

  it('экранирует значения с разделителем', () => {
    const rows: Row[] = [{ name: 'a;b', n: 1 }];
    expect(toCsv(rows, columns)).toBe('Имя;Число\r\n"a;b";1');
  });
});
