export const TEAM_MEMBERS: readonly string[] = [
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

const TEAM_SET = new Set(TEAM_MEMBERS.map((e) => e.toLowerCase()));

export const isTeamMember = (email: string | null | undefined): boolean =>
  email != null && TEAM_SET.has(email.toLowerCase());
