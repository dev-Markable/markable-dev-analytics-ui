/**
 * Дефолтный набор email-ов команды маркировки. Используется как
 * базовый список при первом запуске и при «сбросить к дефолту».
 * Актуальный список (с пользовательскими правками) живёт в
 * useTeamMembersStore + localStorage.
 */
export const DEFAULT_TEAM_MEMBERS: readonly string[] = [
  'kiril.aksyutik@x5.ru',
  'stepan.ermakov@x5.ru',
  'vikto.zhigunov@x5.ru',
  'aleksand.dorofeev@x5.ru',
  'tatiana.matvienko@x5.ru',
  'vladisla.gritsev@x5.ru',
  'nikit.tomashov@x5.ru',
  'ily.galochkin@x5.ru',
  'boris.osechinskiy@x5.ru',
] as const;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const isEmailValid = (email: string): boolean => EMAIL_RE.test(email.trim());
