import { Modal, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { UserAvatar, userDisplayName } from '@/entities/user';
import { TeamChip } from '@/entities/team';
import { EmptyState } from '@/shared/ui';
import { buildProfilePath } from '@/app/router/paths';
import type { DateRange } from '@/shared/lib';
import type { DrillContent, DrillRow } from '../model/types';

interface DrillDownModalProps {
  content: DrillContent | null;
  /** Период — для диплинков в профиль из строк разбивки. */
  range: DateRange;
  onClose: () => void;
}

function Row({ row, rank, range }: { row: DrillRow; rank: number; range: DateRange }) {
  const user = { email: row.email, name: row.displayName, username: null, avatarUrl: row.avatarUrl };
  return (
    <Link to={buildProfilePath(row.email, range)} className="drilldown__row" onClick={undefined}>
      <span className="drilldown__rank">{rank}</span>
      <span className="drilldown__avatar">
        <UserAvatar user={user} size={34} isLead={row.isLead} />
      </span>
      <span className="drilldown__identity">
        <span className="drilldown__name">{userDisplayName(user)}</span>
        <span className="drilldown__meta">
          <span className="drilldown__email">{row.email}</span>
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
 * Модалка drill-down. Виджеты графиков собирают {@link DrillContent} по клику и
 * поднимают его на страницу; здесь только отрисовка.
 *
 * Раньше это была выезжающая справа Drawer-панель шириной 520px: срез клали
 * набок, список авторов ужимался в узкую колонку, а сам жест «шторка сбоку»
 * читался как служебная панель настроек, а не как разбор цифры. Модалка по
 * центру даёт разбивке нормальную ширину и не спорит с сайдбаром приложения.
 *
 * Диплинк в профиль строится из email + текущего периода.
 */
export function DrillDownModal({ content, range, onClose }: DrillDownModalProps) {
  const hasRows = Boolean(content && content.rows.length > 0);
  const hasHighlights = Boolean(content?.highlights?.length);

  return (
    <Modal
      open={content !== null}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      className="drilldown-modal"
      destroyOnClose
      title={
        <span className="drilldown__head">
          <span className="drilldown__title">{content?.title}</span>
          {content?.subtitle && (
            <span className="drilldown__subtitle">{content.subtitle}</span>
          )}
        </span>
      }
    >
      {hasHighlights && (
        <div className="drilldown__highlights">
          {content?.highlights?.map((h) => (
            <div key={h.label} className="drilldown__highlight">
              <span className="drilldown__highlight-value">{h.value}</span>
              <span className="drilldown__highlight-label">{h.label}</span>
              {h.hint && <span className="drilldown__highlight-hint">{h.hint}</span>}
            </div>
          ))}
        </div>
      )}

      {hasRows && (
        <div className="drilldown__list">
          {content?.rows.map((row, i) => (
            <Row key={row.email} row={row} rank={i + 1} range={range} />
          ))}
        </div>
      )}

      {!hasRows && !hasHighlights && (
        <EmptyState title="Нет данных" description="В этом срезе активности не нашлось." />
      )}

      {hasRows && (
        <Typography.Text type="secondary" className="drilldown__foot">
          Клик по строке — профиль разработчика за тот же период
        </Typography.Text>
      )}
    </Modal>
  );
}
