import { Tooltip } from 'antd';
import { Crown, Table2 } from 'lucide-react';
import { UserAvatar, userDisplayName, type AuthorActivity } from '@/entities/user';
import { SectionCard } from '@/shared/ui';
import { COMPARE_ROWS, rowCells } from '../lib/rows';

interface CompareMatrixProps {
  authors: readonly AuthorActivity[];
}

const asUser = (a: AuthorActivity) => ({
  email: a.email,
  name: a.displayName ?? null,
  username: null,
  avatarUrl: a.avatarUrl ?? null,
});

/**
 * Сравнение метрик: строка — метрика, колонка — разработчик, в ячейке число и
 * полоса его доли от лидера строки.
 *
 * Заменяет пару «радар + таблица». Радар был не просто невнятным, а вводящим в
 * заблуждение: площадь его многоугольника зависит от порядка осей, поэтому
 * перестановка «Тестов» и «Удалено» меняла бы визуальный «размер» человека, ничего
 * не меняя в данных. Плюс нормировка к лидеру рисовала ему единицу по каждой оси,
 * где он первый, и «насколько больше» из картинки не читалось вовсе. Таблица рядом
 * отвечала на тот же вопрос точнее, так что радар оставался украшением.
 *
 * Полоса даёт то, чего не было ни у радара, ни у таблицы: пропорцию. «В полтора
 * раза больше» видно сразу, без вычитания в уме.
 */
export function CompareMatrix({ authors }: CompareMatrixProps) {
  return (
    <SectionCard
      title="Метрики"
      icon={<Table2 size={16} />}
      description="Полоса — доля от лидера строки. Метрики без явного «лучше» не ранжируются."
    >
      <div
        className="cmp-matrix"
        style={{ gridTemplateColumns: `minmax(140px, 200px) repeat(${authors.length}, minmax(0, 1fr))` }}
      >
        <div className="cmp-matrix__corner" />
        {authors.map((a) => (
          <div key={a.email} className="cmp-matrix__head">
            <UserAvatar user={asUser(a)} size={30} isLead={a.isLead} />
            <span className="cmp-matrix__head-name">{userDisplayName(asUser(a))}</span>
            {a.team && <span className="cmp-matrix__head-team">{a.team}</span>}
          </div>
        ))}

        {COMPARE_ROWS.map((row, rowIndex) => {
          const cells = rowCells(row, authors);
          // У первой строки верхней линии нет: её роль уже играет граница шапки.
          const edge = rowIndex === 0 ? ' cmp-matrix__cell--first' : '';
          return (
            <div key={row.key} style={{ display: 'contents' }}>
              <div className={`cmp-matrix__label${edge}`}>
                <span className="cmp-matrix__label-text">{row.label}</span>
                {row.hint && <span className="cmp-matrix__label-hint">{row.hint}</span>}
              </div>

              {cells.map((cell) => (
                <div
                  key={cell.email}
                  className={`cmp-matrix__cell${edge}${
                    cell.isLeader ? ' cmp-matrix__cell--leader' : ''
                  }`}
                >
                  <span className="cmp-matrix__value">
                    {cell.display}
                    {cell.isLeader && (
                      <Tooltip title="Лидер по этой метрике">
                        <span className="cmp-matrix__crown">
                          <Crown size={12} />
                        </span>
                      </Tooltip>
                    )}
                  </span>
                  {cell.share !== null && (
                    <span className="cmp-matrix__bar">
                      <span
                        className="cmp-matrix__bar-fill"
                        style={{ width: `${Math.max(cell.share * 100, 1.5)}%` }}
                      />
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
