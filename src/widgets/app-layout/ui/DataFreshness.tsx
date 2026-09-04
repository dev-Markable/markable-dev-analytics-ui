import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  durationSeconds,
  formatDuration,
  useLatestRun,
  type CollectionRun,
} from '@/entities/collection-run';
import { dayjs } from '@/shared/lib';
import { ROUTES } from '@/app/router/paths';

/** «14:32» сегодня, «вчера, 18:40», дальше — «3 сент, 18:40». */
function formatFinishedAt(iso: string): string {
  const m = dayjs(iso);
  const now = dayjs();
  if (m.isSame(now, 'day')) return m.format('HH:mm');
  if (m.isSame(now.subtract(1, 'day'), 'day')) return `вчера, ${m.format('HH:mm')}`;
  return m.format('D MMMM, HH:mm');
}

function tooltipLines(run: CollectionRun): string[] {
  if (run.status === 'RUNNING') {
    return [`Сбор данных идёт сейчас`, `Начат ${dayjs(run.startedAt).format('D MMMM, HH:mm')}`];
  }
  if (run.status === 'FAILED') {
    return [
      'Последний сбор завершился ошибкой',
      `Закончен в ${dayjs(run.finishedAt ?? run.startedAt).format('HH:mm')}`,
      ...(run.errorMessage ? [run.errorMessage] : []),
    ];
  }
  if (run.status === 'CANCELLED') {
    return [
      'Последний сбор был отменён',
      `Данные актуальны на предыдущий успешный прогон — ${dayjs(
        run.finishedAt ?? run.startedAt,
      ).format('D MMMM, HH:mm')}`,
    ];
  }
  const seconds = durationSeconds(run.startedAt, run.finishedAt);
  return [
    'Последний сбор данных — успешно',
    `Завершён ${formatFinishedAt(run.finishedAt ?? run.startedAt)}`,
    ...(seconds != null ? [`Длительность ${formatDuration(run.startedAt, run.finishedAt)}`] : []),
  ];
}

/**
 * Свежесть данных в правом углу топбара: «Обновлено 14:32».
 *
 * Ключевой вопрос к аналитике — «а данные за сколько?» — раньше требовал похода
 * на страницу сбора. Теперь тихая подпись отвечает на него всегда, клик ведёт
 * к деталям. Пока сбор идёт — живой индикатор с поллингом (общий кэш
 * useLatestRun, новых запросов сверх страницы сбора нет).
 */
export function DataFreshness() {
  const { data: run } = useLatestRun();
  if (!run) return null;

  const finishedAt = run.finishedAt;

  let icon = <CheckCircle2 size={13} />;
  let label = `Обновлено ${formatFinishedAt(finishedAt ?? run.startedAt)}`;
  let cls = 'topbar-freshness';

  if (run.status === 'RUNNING') {
    icon = <Loader2 size={13} className="topbar-freshness__spin" />;
    label = 'Сбор данных…';
  } else if (run.status === 'FAILED') {
    icon = <AlertTriangle size={13} />;
    label = 'Сбор не удался';
    cls += ' topbar-freshness--error';
  } else if (run.status === 'CANCELLED') {
    icon = <AlertTriangle size={13} />;
    label = 'Сбор отменён';
  }

  return (
    <Tooltip
      title={
        <div className="topbar-freshness__tip">
          {tooltipLines(run).map((line, i) => (
            <div key={i} className={i === 0 ? 'topbar-freshness__tip-title' : undefined}>
              {line}
            </div>
          ))}
          <div className="topbar-freshness__tip-hint">Открыть страницу сбора</div>
        </div>
      }
      placement="bottomRight"
      mouseEnterDelay={0.15}
    >
      <Link to={ROUTES.collection} className={cls}>
        {icon}
        <span className="topbar-freshness__label">{label}</span>
      </Link>
    </Tooltip>
  );
}
