import { Col, Row } from 'antd';
import { Activity, Clock } from 'lucide-react';
import type { Commit } from '@/entities/commit';
import type { DateRange } from '@/shared/lib';
import { EmptyState, SectionCard } from '@/shared/ui';
import { ActivityByDayChart } from './ActivityByDayChart';
import { ActivityByHourChart } from './ActivityByHourChart';

interface ProfileActivityProps {
  commits: readonly Commit[];
  range: DateRange;
}

export function ProfileActivity({ commits, range }: ProfileActivityProps) {
  const hasCommits = commits.length > 0;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={16}>
        <SectionCard
          title="По дням"
          icon={<Activity size={16} />}
          description="Коммиты (область) и добавленные строки (линия)"
        >
          {hasCommits ? (
            <ActivityByDayChart commits={commits} range={range} />
          ) : (
            <EmptyState
              title="Нет коммитов"
              description="За выбранный период коммитов не зафиксировано."
            />
          )}
        </SectionCard>
      </Col>

      <Col xs={24} xl={8}>
        <SectionCard
          title="По часам суток"
          icon={<Clock size={16} />}
          description="Распределение коммитов"
        >
          {hasCommits ? <ActivityByHourChart commits={commits} /> : <EmptyState title="Нет данных" />}
        </SectionCard>
      </Col>
    </Row>
  );
}
