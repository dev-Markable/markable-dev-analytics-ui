export const ROUTES = {
  login: '/login',
  dashboard: '/',
  weekly: '/weekly',
  activity: '/activity',
  defects: '/defects',
  mergedMrs: '/merged-mrs',
  compare: '/compare',
  performanceReview: '/performance-review',
  cohorts: '/cohorts',
  teams: '/teams',
  profile: (email = ':email') => `/users/${email}`,
  profileMask: '/users/:email',
  collection: '/collection',
  settings: '/settings',
  notFound: '*',
} as const;

export const buildProfilePath = (
  email: string,
  range?: { from: string; to: string } | null,
): string => {
  const base = ROUTES.profile(encodeURIComponent(email));
  if (!range) return base;
  const qs = new URLSearchParams({ from: range.from, to: range.to });
  return `${base}?${qs.toString()}`;
};
