import { Tooltip } from 'antd';
import { ListTree } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAvatar, userDisplayName } from '@/entities/user';
import { CardTypeBadge, type KaitenCardType } from '@/entities/kaiten-card';
import { EmptyState, LoadingState, SectionCard } from '@/shared/ui';
import { formatNumber } from '@/shared/lib';
import { buildProfilePath } from '@/app/router/paths';
import type { DateRange } from '@/shared/lib';
import { ORPHAN_KEY } from '@/widgets/profile/tasks-timeline';
import {
  maxTaskCommits,
  TASKS_PER_COLUMN,
  TYPE_ORDER,
  type CompareTaskColumn,
} from '../lib/build-columns';

interface CompareTasksProps {
  columns: readonly CompareTaskColumn[];
  loading: boolean;
  range: DateRange;
}

const TYPE_LABEL: Record<KaitenCardType, string> = {
  DEVELOPMENT: 'разработка',
  DEFECT: 'дефекты',
  TASK: 'задачи',
  OTHER: 'прочее',
};

/** Одно число со своей подписью в сводке колонки. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="cmp-tasks__stat">
      <span className="cmp-tasks__stat-value">{value}</span>
      <span className="cmp-tasks__stat-label">{label}</span>
    </span>
  );
}

/**
 * Задачи выбранных разработчиков колонками — со сводкой и общей шкалой.
 *
 * Отвечает на вопрос, которого не было на странице: цифры показывали, кто сделал
 * больше, но не над чем и не какой ценой. Две одинаковые по объёму недели могут
 * быть неделей одной крупной фичи и неделей десяти мелких багов — на ревью это
 * разный разговор.
 */
export function CompareTasks({ columns, loading, range }: CompareTasksProps) {
  const empty = !loading && columns.every((c) => c.tasks.length === 0);
  const scale = maxTaskCommits(columns);

  return (
    <SectionCard
      title="Над чем работали"
      icon={<ListTree size={16} />}
      description={`Задачи Kaiten с коммитами в периоде · до ${TASKS_PER_COLUMN} на человека · полосы в общей шкале`}
    >
      {loading ? (
        <LoadingState label="Загружаем задачи" />
      ) : empty ? (
        <EmptyState
          title="Задач не нашлось"
          description="За выбранный период ни у кого нет коммитов, привязанных к карточкам Kaiten."
        />
      ) : (
        <>
          <div
            className="cmp-tasks"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((col) => {
              const user = {
                email: col.email,
                name: col.displayName,
                username: null,
                avatarUrl: col.avatarUrl,
              };

              return (
                <div key={col.email} className="cmp-tasks__col">
                  <Link to={buildProfilePath(col.email, range)} className="cmp-tasks__owner">
                    <UserAvatar user={user} size={30} isLead={col.isLead} />
                    <span className="cmp-tasks__owner-name">{userDisplayName(user)}</span>
                  </Link>

                  <div className="cmp-tasks__summary">
                    <Stat value={formatNumber(col.totalTasks)} label="задач" />
                    <Stat value={formatNumber(col.totalCommits)} label="коммитов" />
                    <Stat
                      value={col.commitsPerTask > 0 ? col.commitsPerTask.toFixed(1) : '—'}
                      label="на задачу"
                    />
                  </div>

                  {/* Состав работы: разработка / дефекты / прочее в долях коммитов.
                      Именно он отличает «вёл фичу» от «разгребал баги». */}
                  {col.totalCommits > 0 && (
                    <>
                      <div className="cmp-tasks__mix">
                        {col.byType.map((slice) => (
                          <Tooltip
                            key={slice.type}
                            title={`${TYPE_LABEL[slice.type]}: ${slice.tasks} задач, ${slice.commits} коммитов`}
                          >
                            <span
                              className={`cmp-tasks__mix-seg cmp-tasks__mix-seg--${slice.type.toLowerCase()}`}
                              style={{ flexGrow: slice.commits }}
                            />
                          </Tooltip>
                        ))}
                      </div>
                      <div className="cmp-tasks__legend">
                        {TYPE_ORDER.filter((t) => col.byType.some((s) => s.type === t)).map((t) => (
                          <span key={t} className="cmp-tasks__legend-item">
                            <span
                              className={`cmp-tasks__legend-dot cmp-tasks__legend-dot--${t.toLowerCase()}`}
                            />
                            {TYPE_LABEL[t]}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  <span className="cmp-tasks__done">
                    {col.doneTasks > 0
                      ? `${formatNumber(col.doneTasks)} из ${formatNumber(col.totalTasks)} доведено до DONE`
                      : 'ни одна задача не закрыта в периоде'}
                  </span>

                  {col.tasks.length === 0 ? (
                    <p className="cmp-tasks__none">Нет задач с коммитами</p>
                  ) : (
                    <ul className="cmp-tasks__list">
                      {col.tasks.map((task) => {
                        const card = task.card;
                        const title =
                          card?.title ??
                          (task.key === ORPHAN_KEY ? 'Без задачи' : 'Карточка не найдена');
                        const body = (
                          <>
                            <span className="cmp-tasks__task-head">
                              {card && <CardTypeBadge cardType={card.cardType} iconOnly />}
                              <span className="cmp-tasks__task-id">
                                #{card?.id ?? task.taskNumber}
                              </span>
                              <span className="cmp-tasks__task-commits">
                                {formatNumber(task.totalCommits)}
                              </span>
                            </span>
                            <span className="cmp-tasks__task-title">{title}</span>
                            <span className="cmp-tasks__task-bar">
                              <span
                                className={`cmp-tasks__task-bar-fill cmp-tasks__task-bar-fill--${(
                                  card?.cardType ?? 'OTHER'
                                ).toLowerCase()}`}
                                style={{
                                  width: `${Math.max((task.totalCommits / scale) * 100, 2)}%`,
                                }}
                              />
                            </span>
                          </>
                        );

                        return (
                          <li key={task.key} className="cmp-tasks__task">
                            {card?.url ? (
                              <a
                                href={card.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cmp-tasks__task-link"
                              >
                                {body}
                              </a>
                            ) : (
                              <span className="cmp-tasks__task-link">{body}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {col.totalTasks > col.tasks.length && (
                    <span className="cmp-tasks__more">
                      ещё {formatNumber(col.totalTasks - col.tasks.length)} в профиле
                    </span>
                  )}
                  {col.orphanCommits > 0 && (
                    <span className="cmp-tasks__orphan">
                      {formatNumber(col.orphanCommits)} коммитов без номера задачи
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </SectionCard>
  );
}
