/**
 * Короткая метка MR из web_url: `.../-/merge_requests/43413` → `!43413` (как в GitLab).
 * Показывать имя репозитория в каждой строке бессмысленно — оно почти всегда одно и то же;
 * номер MR различает ссылки, а репо уходит в подпись/тултип.
 */
export const mrLabel = (url: string): string => {
  const match = /\/merge_requests\/(\d+)/.exec(url);
  return match ? `!${match[1]}` : 'MR';
};

/** Короткое имя репо для подписи: `gkr/xrg-core` → `xrg-core`. */
export const shortRepo = (repo: string | null | undefined): string => {
  if (!repo) return '';
  const parts = repo.split('/');
  return parts[parts.length - 1] ?? repo;
};
