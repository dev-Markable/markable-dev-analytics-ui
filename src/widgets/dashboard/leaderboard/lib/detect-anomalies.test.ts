import { describe, expect, it } from 'vitest';
import { detectAnomaliesByAuthor } from './detect-anomalies';
import { makeDaily } from '@/shared/test/factories';

const RANGE = { from: '2026-05-01', to: '2026-05-30' };

describe('detectAnomaliesByAuthor', () => {
  it('пусто → пустая мапа', () => {
    expect(detectAnomaliesByAuthor([], RANGE).size).toBe(0);
  });

  it('STALE: последний коммит давно', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-02', commits: 3, mergeCommits: 0 }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'STALE')).toBe(true);
  });

  it('не STALE, если коммитил у конца периода', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-29', commits: 3, mergeCommits: 0 }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'STALE')).toBe(false);
  });

  it('DECLINING: вторая половина слабее первой', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-03', commits: 10, mergeCommits: 0 }),
      makeDaily({ email: 'a@x5.ru', date: '2026-05-28', commits: 1, mergeCommits: 0 }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'DECLINING')).toBe(true);
  });

  it('LOW_TESTS: много кода, мало тестов', () => {
    const daily = [
      makeDaily({
        email: 'a@x5.ru',
        date: '2026-05-28',
        commits: 5,
        mergeCommits: 0,
        addedLines: 1000,
        testAddedLines: 10,
      }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'LOW_TESTS')).toBe(true);
  });

  it('нет LOW_TESTS при достаточной доле тестов', () => {
    const daily = [
      makeDaily({
        email: 'a@x5.ru',
        date: '2026-05-28',
        commits: 5,
        mergeCommits: 0,
        addedLines: 1000,
        testAddedLines: 300,
      }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'LOW_TESTS')).toBe(false);
  });

  it('здоровый автор → не в мапе', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-15', commits: 5, mergeCommits: 0, addedLines: 100, testAddedLines: 50 }),
      makeDaily({ email: 'a@x5.ru', date: '2026-05-28', commits: 6, mergeCommits: 0, addedLines: 100, testAddedLines: 50 }),
    ];
    expect(detectAnomaliesByAuthor(daily, RANGE).has('a@x5.ru')).toBe(false);
  });

  it('merge-коммиты не считаются активностью для STALE', () => {
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-15', commits: 5, mergeCommits: 0 }),
      // только merge в конце — не сбрасывает stale
      makeDaily({ email: 'a@x5.ru', date: '2026-05-29', commits: 2, mergeCommits: 2 }),
    ];
    const flags = detectAnomaliesByAuthor(daily, RANGE).get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'STALE')).toBe(true);
  });

  // ── Регрессия: период, уходящий в будущее ──────────────────────────────
  // До фикски ненаступившие дни считались простоем и «спадом 100%»,
  // поэтому аномалии получали все активно работающие люди.
  describe('период заканчивается в будущем', () => {
    const NOW = '2026-05-15';
    const FUTURE_RANGE = { from: '2026-05-01', to: '2026-05-31' };

    it('активно коммитящий сегодня не получает ни STALE, ни DECLINING', () => {
      const daily = [
        makeDaily({ email: 'a@x5.ru', date: '2026-05-05', commits: 5, mergeCommits: 0 }),
        makeDaily({ email: 'a@x5.ru', date: '2026-05-08', commits: 5, mergeCommits: 0 }),
        makeDaily({ email: 'a@x5.ru', date: '2026-05-12', commits: 5, mergeCommits: 0 }),
        makeDaily({ email: 'a@x5.ru', date: '2026-05-15', commits: 5, mergeCommits: 0 }),
      ];
      expect(detectAnomaliesByAuthor(daily, FUTURE_RANGE, NOW).has('a@x5.ru')).toBe(false);
    });

    it('простой считается до сегодня, а не до конца периода', () => {
      const daily = [makeDaily({ email: 'a@x5.ru', date: '2026-05-02', commits: 6, mergeCommits: 0 })];
      const stale = (detectAnomaliesByAuthor(daily, FUTURE_RANGE, NOW).get('a@x5.ru') ?? []).find(
        (f) => f.type === 'STALE',
      );
      // 3–15 мая 2026 по производственному календарю: 9 рабочих дней —
      // выпадают выходные, 9 мая (сб, праздник) и перенос на 11 мая (пн).
      // Не 29 календарных дней до конца месяца.
      expect(stale?.label).toBe('9 раб. дн без коммитов');
    });

    it('половины периода делятся по прошедшим дням', () => {
      // Прошло 1–15 мая, середина — 8 мая. Спад реальный: 12 коммитов → 1.
      const daily = [
        makeDaily({ email: 'a@x5.ru', date: '2026-05-02', commits: 6, mergeCommits: 0 }),
        makeDaily({ email: 'a@x5.ru', date: '2026-05-04', commits: 6, mergeCommits: 0 }),
        makeDaily({ email: 'a@x5.ru', date: '2026-05-14', commits: 1, mergeCommits: 0 }),
      ];
      const flags = detectAnomaliesByAuthor(daily, FUTURE_RANGE, NOW).get('a@x5.ru') ?? [];
      expect(flags.some((f) => f.type === 'DECLINING')).toBe(true);
    });
  });

  it('короткий период (< 4 дней) не оценивается на спад — делить нечего', () => {
    const range = { from: '2026-05-10', to: '2026-05-12' };
    const daily = [
      makeDaily({ email: 'a@x5.ru', date: '2026-05-10', commits: 9, mergeCommits: 0 }),
      makeDaily({ email: 'a@x5.ru', date: '2026-05-12', commits: 1, mergeCommits: 0 }),
    ];
    const flags = detectAnomaliesByAuthor(daily, range, '2026-05-12').get('a@x5.ru') ?? [];
    expect(flags.some((f) => f.type === 'DECLINING')).toBe(false);
  });

  // ── Регрессия: выходные не считаются простоем ─────────────────────────
  // Раньше эвристики считали календарные дни, и человек, закрывший задачи
  // в пятницу, к среде получал «5 дн без коммитов» — хотя пропустил 3 рабочих.
  describe('выходные', () => {
    it('пятница → среда: 3 рабочих дня, не аномалия', () => {
      const daily = [
        // 7 августа 2026 — пятница
        makeDaily({ email: 'a@x5.ru', date: '2026-08-05', commits: 5, mergeCommits: 0 }),
        makeDaily({ email: 'a@x5.ru', date: '2026-08-07', commits: 5, mergeCommits: 0 }),
      ];
      const range = { from: '2026-08-01', to: '2026-08-12' };
      const flags = detectAnomaliesByAuthor(daily, range, '2026-08-12').get('a@x5.ru') ?? [];
      expect(flags.some((f) => f.type === 'STALE')).toBe(false);
    });

    it('ровная работа по будням не даёт ложного спада (половины неравны по рабочим дням)', () => {
      // Период пн–вс: первая половина 3 будних дня, вторая — 2 будних + выходные.
      const daily = ['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07'].map(
        (date) => makeDaily({ email: 'a@x5.ru', date, commits: 6, mergeCommits: 0 }),
      );
      const range = { from: '2026-08-03', to: '2026-08-09' };
      const flags = detectAnomaliesByAuthor(daily, range, '2026-08-09').get('a@x5.ru') ?? [];
      expect(flags.some((f) => f.type === 'DECLINING')).toBe(false);
    });

    it('реальный простой в две недели по-прежнему ловится', () => {
      const daily = [makeDaily({ email: 'a@x5.ru', date: '2026-07-31', commits: 5, mergeCommits: 0 })];
      const range = { from: '2026-07-20', to: '2026-08-12' };
      const stale = (detectAnomaliesByAuthor(daily, range, '2026-08-12').get('a@x5.ru') ?? []).find(
        (f) => f.type === 'STALE',
      );
      expect(stale?.label).toBe('8 раб. дн без коммитов');
    });
  });

  // ── Регрессия: производственный календарь РФ ──────────────────────────
  describe('праздники', () => {
    it('новогодние каникулы не считаются простоем', () => {
      const daily = [
        makeDaily({ email: 'a@x5.ru', date: '2025-12-29', commits: 5, mergeCommits: 0 }),
        makeDaily({ email: 'a@x5.ru', date: '2025-12-30', commits: 5, mergeCommits: 0 }),
      ];
      const range = { from: '2025-12-20', to: '2026-01-12' };
      expect(detectAnomaliesByAuthor(daily, range, '2026-01-12').has('a@x5.ru')).toBe(false);
    });

    it('майские: ровная работа во все рабочие дни без аномалий', () => {
      const daily = [
        '2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08',
        '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15',
      ].map((date) => makeDaily({ email: 'a@x5.ru', date, commits: 5, mergeCommits: 0 }));
      const range = { from: '2026-05-01', to: '2026-05-15' };
      expect(detectAnomaliesByAuthor(daily, range, '2026-05-15').has('a@x5.ru')).toBe(false);
    });

    it('простой ПОСЛЕ каникул всё равно ловится', () => {
      const daily = [makeDaily({ email: 'a@x5.ru', date: '2025-12-29', commits: 5, mergeCommits: 0 })];
      const range = { from: '2025-12-20', to: '2026-01-20' };
      const stale = (detectAnomaliesByAuthor(daily, range, '2026-01-20').get('a@x5.ru') ?? []).find(
        (f) => f.type === 'STALE',
      );
      expect(stale?.label).toBe('8 раб. дн без коммитов');
    });

    it('спад не считается, если в половине меньше 3 рабочих дней', () => {
      // Вторая половина — только 31 декабря: одного дня мало для вывода о темпе.
      const daily = [
        makeDaily({ email: 'a@x5.ru', date: '2025-12-29', commits: 5, mergeCommits: 0 }),
        makeDaily({ email: 'a@x5.ru', date: '2025-12-30', commits: 5, mergeCommits: 0 }),
      ];
      const range = { from: '2025-12-20', to: '2026-01-12' };
      const flags = detectAnomaliesByAuthor(daily, range, '2026-01-12').get('a@x5.ru') ?? [];
      expect(flags.some((f) => f.type === 'DECLINING')).toBe(false);
    });
  });
});
