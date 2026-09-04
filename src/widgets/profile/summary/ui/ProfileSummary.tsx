import { useMemo } from 'react';
import { StatTile } from '@/shared/ui';
import { formatNumber, formatPercent, safeDiv } from '@/shared/lib';
import type { AuthorSummary, AuthorActivity } from '@/entities/user';
import type { KaitenCard } from '@/entities/kaiten-card';
import { summarizeCards } from '../lib/aggregate-cards';
import { buildProfileCodeStats } from '../lib/compare-code';

interface ProfileSummaryProps {
  summary: AuthorSummary;
  cards: readonly KaitenCard[];
  /** Авторы команды за тот же период — база для сравнения. undefined = сравнения нет. */
  teamAuthors?: readonly AuthorActivity[];
  email: string;
}

/**
 * Хелпер для hint'а карточек — собирает «X разработка · Y дефекты» или
 * показывает только непустую часть.
 */
const typeBreakdown = (dev: number, defect: number): string => {
  const parts: string[] = [];
  if (dev > 0) parts.push(`${dev} разработка`);
  if (defect > 0) parts.push(`${defect} дефект${defect === 1 ? '' : 'ы'}`);
  return parts.join(' · ');
};

export function ProfileSummary({ summary, cards, teamAuthors, email }: ProfileSummaryProps) {
  const testRatio = safeDiv(summary.testAddedLines, summary.addedLines) * 100;
  const nonMerge = summary.commits - summary.mergeCommits;
  const linesPerCommit = safeDiv(summary.addedLines, nonMerge);

  const c = useMemo(() => summarizeCards(cards), [cards]);
  const closedHint =
    c.total > 0
      ? typeBreakdown(c.closedDev, c.closedDefect) ||
        formatPercent(safeDiv(c.closed, c.total) * 100, 0)
      : '—';

  const team = useMemo(
    () => buildProfileCodeStats(teamAuthors, email),
    [teamAuthors, email],
  );

  return (
    // «Коммитов всего», «Добавлено/удалено» и «Карточек в работе» переехали в hero —
    // здесь остаются только не продублированные показатели.
    //
    // «Merge-коммиты» убраны: у большинства это ноль (rebase-воркфлоу), а треть ряда
    // карточка занимала. Само число не потеряно — оно подписью под коммитами в hero.
    <div className="profile-code">
      <StatTile
        value={formatPercent(testRatio, 1)}
        label="тестовый код"
        hint={`${formatNumber(summary.testAddedLines)} строк из ${formatNumber(summary.addedLines)}`}
        comparison={
          team
            ? {
                standing: team.testRatio.standing,
                avgLabel: formatPercent(team.testRatio.teamAvg, 1),
              }
            : undefined
        }
      />
      <StatTile
        value={formatNumber(Math.round(linesPerCommit))}
        label="строк на коммит"
        hint={
          team
            ? `по команде ~${formatNumber(Math.round(team.linesPerCommit.teamAvg))} · ${formatNumber(nonMerge)} не-мердж коммитов`
            : `${formatNumber(nonMerge)} не-мердж коммитов`
        }
      />
      <StatTile
        value={formatNumber(c.closed)}
        label="карточек закрыто"
        hint={closedHint}
      />
    </div>
  );
}
