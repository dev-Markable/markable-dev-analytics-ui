import { Trophy } from 'lucide-react';
import { useMemo } from 'react';
import type { AsyncState } from '@/shared/api';
import type { AuthorActivity } from '@/entities/user';
import type { DailyStat } from '@/entities/stats';
import type { DateRange } from '@/shared/lib';
import { AsyncContent, EmptyState, SectionCard } from '@/shared/ui';
import { RankingRow } from './RankingRow';
import { detectAnomaliesByAuthor } from '../lib/detect-anomalies';
import { LeaderboardSkeleton } from './LeaderboardSkeleton';

interface RankingBoardProps {
  top: readonly AuthorActivity[];
  outsiders: readonly AuthorActivity[];
  status: AsyncState<unknown>['status'];
  error?: AsyncState<unknown>['error'];
  onRetry?: () => void;
  range: DateRange;
  /** Активен глобальный фильтр команды — чип команды в строках лишний. */
  teamFilterEnabled: boolean;
  /** Дневные агрегаты — из них считаются аномалии (простой, спад, мало тестов). */
  daily?: readonly DailyStat[];
  emptyDescription?: string;
}

/**
 * Рейтинг активности одним списком.
 *
 * Раньше это были две карточки в ряд («Топ» и «Аутсайдеры»), и вторая почти всегда
 * пустовала — половина ширины уходила впустую. Здесь один непрерывный рейтинг:
 * лидеры сверху, отстающие — после разделителя, приглушённые.
 */
export function RankingBoard({
  top,
  outsiders,
  status,
  error,
  onRetry,
  range,
  teamFilterEnabled,
  daily,
  emptyDescription = 'За выбранный период активность не зафиксирована.',
}: RankingBoardProps) {
  // Аномалии считаются по дневному ряду: спад внутри периода, простой в конце,
  // низкая доля тестов. Это другой срез, чем сигналы «период к периоду» рядом.
  const anomalies = useMemo(
    () => (daily && daily.length > 0 ? detectAnomaliesByAuthor(daily, range) : new Map()),
    [daily, range],
  );
  const description = `${top.length + outsiders.length} разработчиков · по убыванию activity score`;

  return (
    <SectionCard title="Рейтинг активности" icon={<Trophy size={16} />} description={description}>
      <AsyncContent
        status={status}
        isEmpty={top.length === 0 && outsiders.length === 0}
        error={error}
        onRetry={onRetry}
        skeleton={<LeaderboardSkeleton />}
        empty={<EmptyState title="Нет данных" description={emptyDescription} />}
      >
        <div className="ranking">
          {top.map((row, index) => (
            <RankingRow
              key={row.email}
              rank={index + 1}
              data={row}
              range={range}
              variant="top"
              hideTeam={teamFilterEnabled}
              anomalies={anomalies.get(row.email)}
            />
          ))}

          {outsiders.length > 0 && (
            <div className="ranking__divider">
              <span>Ниже среднего</span>
            </div>
          )}

          {outsiders.map((row, index) => (
            <RankingRow
              key={row.email}
              rank={top.length + index + 1}
              data={row}
              range={range}
              variant="outsider"
              hideTeam={teamFilterEnabled}
              anomalies={anomalies.get(row.email)}
            />
          ))}
        </div>
      </AsyncContent>
    </SectionCard>
  );
}
