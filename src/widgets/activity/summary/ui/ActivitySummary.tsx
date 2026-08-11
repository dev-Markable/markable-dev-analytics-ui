import { useMemo } from 'react';
import { Col, Row } from 'antd';
import { CalendarCheck, FolderGit2, GitCommit, Users } from 'lucide-react';
import type { DailyStat } from '@/entities/stats';
import { MetricCard, Sparkline } from '@/shared/ui';
import { countWorkingDays, dayjs, formatNumber, type DateRange } from '@/shared/lib';
import { aggregateTotals, dailySeries } from '../lib/aggregate';

interface ActivitySummaryProps {
  daily: readonly DailyStat[];
  range: DateRange;
}

/** Склонение «дня/дней» для дроби «5 из 5 рабочих дней». */
const daysWord = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'дня';
  return 'дней';
};

const SUCCESS = 'var(--ant-color-success)';
const MUTED = 'var(--ant-color-text-tertiary)';

export function ActivitySummary({ daily, range }: ActivitySummaryProps) {
  const totals = useMemo(() => aggregateTotals(daily), [daily]);
  const series = useMemo(() => dailySeries(daily), [daily]);

  /**
   * Знаменатель — рабочие дни, а не календарные, и не дальше сегодняшнего дня.
   *
   * Неделя 3–9 августа содержит ровно 5 рабочих дней: команда, закрывшая все
   * пять, показывала «71% от периода (7 дн)» — будто треть периода простаивала.
   * Ещё не наступившие дни периода тоже не должны попадать в знаменатель.
   *
   * Дробь вместо процента намеренно: коммит в субботу увёл бы долю за 100% и
   * читался бы как баг. Выходные вынесены отдельной подписью.
   */
  const workingDays = useMemo(() => {
    const today = dayjs().startOf('day');
    const end = dayjs(range.to).isAfter(today, 'day') ? today : dayjs(range.to);
    return countWorkingDays(range.from, end);
  }, [range.from, range.to]);

  const activeWorkingDays = totals.activeDays - totals.weekendDays;
  const activeHint =
    workingDays > 0
      ? `${formatNumber(activeWorkingDays)} из ${formatNumber(workingDays)} рабочих ${daysWord(workingDays)}` +
        (totals.weekendDays > 0
          ? ` · +${formatNumber(totals.weekendDays)} в выходные`
          : '')
      : 'в периоде нет рабочих дней';

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} xl={6}>
        <MetricCard
          label="Коммитов"
          value={formatNumber(totals.totalCommits)}
          hint={`${formatNumber(totals.totalMergeCommits)} merge · ${formatNumber(totals.uniqueRepos)} репо`}
          icon={<GitCommit size={16} />}
          sparkline={<Sparkline data={series.commits} />}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <MetricCard
          label="Уникальных авторов"
          value={formatNumber(totals.uniqueAuthors)}
          hint="в выбранном периоде"
          icon={<Users size={16} />}
          sparkline={<Sparkline data={series.authors} />}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <MetricCard
          label="Строк кода"
          value={
            <span style={{ whiteSpace: 'nowrap' }}>
              +{formatNumber(totals.totalAddedLines)}
              <span style={{ color: 'var(--ant-color-text-tertiary)', fontWeight: 500 }}>
                {' / '}
              </span>
              −{formatNumber(totals.totalDeletedLines)}
            </span>
          }
          hint={`тестов: ${formatNumber(totals.totalTestAddedLines)}`}
          icon={<FolderGit2 size={16} />}
          sparkline={<Sparkline data={series.addedLines} color={SUCCESS} />}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <MetricCard
          label="Активных дней"
          value={formatNumber(totals.activeDays)}
          hint={activeHint}
          icon={<CalendarCheck size={16} />}
          sparkline={<Sparkline data={series.commits} color={MUTED} />}
        />
      </Col>
    </Row>
  );
}
