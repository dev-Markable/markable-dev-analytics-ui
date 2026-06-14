import { Drawer, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { UserAvatar, userDisplayName } from '@/entities/user';
import { TeamChip } from '@/entities/team';
import { EmptyState } from '@/shared/ui';
import { buildProfilePath } from '@/app/router/paths';
import type { DateRange } from '@/shared/lib';
import type { DrillContent, DrillRow } from '../model/types';

interface DrillDownDrawerProps {
  content: DrillContent | null;
  /** Период — для диплинков в профиль из строк разбивки. */
  range: DateRange;
  onClose: () => void;
}

function Row({ row, range }: { row: DrillRow; range: DateRange }) {
  const user = { email: row.email, name: row.displayName, username: null, avatarUrl: row.avatarUrl };
  return (
    <Link to={buildProfilePath(row.email, range)} className="drilldown__row">
      <span className="drilldown__avatar">
        <UserAvatar user={user} size={32} isLead={row.isLead} />
      </span>
      <span className="drilldown__identity">
        <Typography.Text className="drilldown__name">{userDisplayName(user)}</Typography.Text>
        <span className="drilldown__meta">
          <Typography.Text className="drilldown__email">{row.email}</Typography.Text>
          {row.team && <TeamChip team={row.team} />}
        </span>
      </span>
      <span className="drilldown__stats">
        {row.stats.map((s) => (
          <span key={s.label} className="drilldown__stat">
            <span className="drilldown__stat-value">{s.value}</span>
            <span className="drilldown__stat-label">{s.label}</span>
          </span>
        ))}
      </span>
    </Link>
  );
}

/**
 * Презентационная панель drill-down. Виджеты графиков собирают {@link DrillContent}
 * по клику и поднимают его на страницу; здесь только отрисовка списка
 * разработчиков среза. Диплинк в профиль строится из email + текущего периода.
 */
export function DrillDownDrawer({ content, range, onClose }: DrillDownDrawerProps) {
  return (
    <Drawer
      open={content !== null}
      onClose={onClose}
      title={content?.title}
      width={520}
      className="drilldown"
      destroyOnClose
    >
      {content && content.rows.length > 0 ? (
        <>
          {content.subtitle && (
            <Typography.Text type="secondary" className="drilldown__subtitle">
              {content.subtitle}
            </Typography.Text>
          )}
          <div className="drilldown__list">
            {content.rows.map((row) => (
              <Row key={row.email} row={row} range={range} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="Нет данных" description="В этом срезе активности не нашлось." />
      )}
    </Drawer>
  );
}
