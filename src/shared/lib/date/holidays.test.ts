import { describe, expect, it } from 'vitest';
import { countWorkingDays, dayKind, isWorkingDay } from './holidays';

describe('isWorkingDay', () => {
  it('будни — рабочие', () => {
    // 12 августа 2026 — среда
    expect(isWorkingDay('2026-08-12')).toBe(true);
  });

  it('суббота и воскресенье — выходные', () => {
    expect(isWorkingDay('2026-08-08')).toBe(false); // сб
    expect(isWorkingDay('2026-08-09')).toBe(false); // вс
  });

  it('новогодние каникулы — нерабочие, даже если это будни', () => {
    // 1–8 января 2026: чт, пт, сб, вс, пн, вт, ср, чт
    for (let day = 1; day <= 8; day += 1) {
      const date = `2026-01-0${day}`;
      expect(isWorkingDay(date), date).toBe(false);
    }
  });

  it('фиксированные праздники нерабочие в любой год', () => {
    expect(isWorkingDay('2026-02-23')).toBe(false); // пн, День защитника Отечества
    expect(isWorkingDay('2026-03-08')).toBe(false); // вс
    expect(isWorkingDay('2026-05-01')).toBe(false); // пт
    expect(isWorkingDay('2026-05-09')).toBe(false); // сб
    expect(isWorkingDay('2026-06-12')).toBe(false); // пт
    expect(isWorkingDay('2026-11-04')).toBe(false); // ср
  });

  it('праздник на выходном переносится на следующий рабочий день (ст. 112 ТК РФ)', () => {
    // 8 марта 2026 — воскресенье → выходной переносится на понедельник 9 марта
    expect(isWorkingDay('2026-03-09')).toBe(false);
    // 9 мая 2026 — суббота → переносится на понедельник 11 мая
    expect(isWorkingDay('2026-05-11')).toBe(false);
  });

  it('перенос не затирает соседний праздник, а идёт дальше', () => {
    // 2027: 1 января — пятница, 2 и 3 января — сб/вс. Переносы не должны попадать
    // на 4–8 января (они и так каникулы) — только на первые рабочие дни после них.
    expect(isWorkingDay('2027-01-11')).toBe(false); // перенос за 2 января (сб)
    expect(isWorkingDay('2027-01-12')).toBe(false); // перенос за 3 января (вс)
  });
});

describe('countWorkingDays', () => {
  it('рабочая неделя пн–пт = 5 дней', () => {
    expect(countWorkingDays('2026-08-03', '2026-08-07')).toBe(5);
  });

  it('календарная неделя пн–вс = 5 рабочих дней', () => {
    expect(countWorkingDays('2026-08-03', '2026-08-09')).toBe(5);
  });

  it('новогодние каникулы не дают рабочих дней', () => {
    // 2026: каникулы 1–8 января; 3 и 4 января — сб/вс, их переносы забирают
    // 9 января (пт) и 12 января (пн). 10–11 — выходные. Итого 1–11 января нерабочие.
    expect(countWorkingDays('2026-01-01', '2026-01-11')).toBe(0);
    expect(isWorkingDay('2026-01-12')).toBe(false);
    expect(isWorkingDay('2026-01-13')).toBe(true);
  });

  it('майские: длинные выходные не считаются рабочими днями', () => {
    // 1 мая (пт, праздник), 2–3 (сб/вс), 4–8 рабочие, 9 (сб, праздник),
    // 10 (вс), 11 (пн — перенос за 9 мая)
    expect(countWorkingDays('2026-05-01', '2026-05-11')).toBe(5);
  });

  it('интервал задом наперёд → 0', () => {
    expect(countWorkingDays('2026-08-10', '2026-08-03')).toBe(0);
  });

  it('один рабочий день → 1, один выходной → 0', () => {
    expect(countWorkingDays('2026-08-12', '2026-08-12')).toBe(1);
    expect(countWorkingDays('2026-08-08', '2026-08-08')).toBe(0);
  });
});

describe('dayKind', () => {
  it('обычный будний день — рабочий', () => {
    expect(dayKind('2026-08-12')).toBe('working'); // среда
  });

  it('суббота и воскресенье — выходные', () => {
    expect(dayKind('2026-08-08')).toBe('weekend');
    expect(dayKind('2026-08-09')).toBe('weekend');
  });

  it('праздник в будний день — праздник, а не выходной', () => {
    expect(dayKind('2026-06-12')).toBe('holiday'); // День России, пятница
    expect(dayKind('2026-02-23')).toBe('holiday'); // понедельник
  });

  it('праздник, выпавший на выходной, остаётся праздником', () => {
    expect(dayKind('2026-05-09')).toBe('holiday'); // суббота — День Победы
  });

  it('перенос праздника — тоже праздник: 11 мая нерабочий из-за 9 мая', () => {
    expect(dayKind('2026-05-11')).toBe('holiday'); // понедельник
  });
});
