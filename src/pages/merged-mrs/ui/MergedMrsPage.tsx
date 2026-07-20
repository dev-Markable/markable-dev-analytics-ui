import { useMemo } from 'react';
import { Col, Row } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { FolderGit2, GitMerge, UsersRound } from 'lucide-react';
import { PageHeader, PageSection, SectionCard, MetricCard, EmptyState, DataTable } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';
import { queryToAsyncState } from '@/shared/api';
import { formatRange, rangeDays } from '@/shared/lib';
import { useDateRange } from '@/features/date-range-filter';
import { ALL_TEAMS, NO_TEAM, useTeamScope } from '@/features/team-scope';
import { mergedMrsQuery, type MergedMrByAuthor, type MergedMrByRepo } from '@/entities/stats';
import { UserChip } from '@/entities/user';

export function MergedMrsPage() {
  useDocumentTitle('Вмерженные MR');

  const range = useDateRange();
  const scope = useTeamScope();
  const teamSelected = scope !== ALL_TEAMS && scope !== NO_TEAM;

  const q = useQuery(
    mergedMrsQuery({ from: range.from, to: range.to, team: teamSelected ? scope : '' }),
  );
  const state = queryToAsyncState(q);

  const days = useMemo(() => rangeDays(range), [range]);
  const subtitle = teamSelected
    ? `${formatRange(range.from, range.to)} · ${days} ${days === 1 ? 'день' : 'дней'} · команда «${scope}» · только dev-ветки`
    : 'Сколько MR вмержено командой за период (только dev-ветки)';

  const columns: ColumnsType<MergedMrByAuthor> = [
    {
      title: 'Разработчик',
      dataIndex: 'email',
      key: 'author',
      render: (_, a) => (
        <UserChip
          user={{ email: a.email, name: a.displayName ?? null, username: null, avatarUrl: a.avatarUrl ?? null }}
          range={range}
        />
      ),
    },
    {
      title: 'Вмержено MR',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      width: 160,
      sorter: (a, b) => a.count - b.count,
      defaultSortOrder: 'descend',
    },
  ];

  const repoColumns: ColumnsType<MergedMrByRepo> = [
    {
      title: 'Репозиторий',
      dataIndex: 'repo',
      key: 'repo',
      render: (repo: string) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{repo}</span>,
    },
    {
      title: 'Вмержено MR',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      width: 160,
      sorter: (a, b) => a.count - b.count,
      defaultSortOrder: 'descend',
    },
  ];

  if (!teamSelected) {
    return (
      <>
        <PageHeader title="Вмерженные MR" subtitle={subtitle} />
        <PageSection>
          <EmptyState
            icon={<UsersRound size={28} strokeWidth={1.5} />}
            title="Выберите команду"
            description="Раздел показывает вмерженные MR выбранной команды. Выберите команду в фильтре команд сверху (сейчас — «вся компания»)."
          />
        </PageSection>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Вмерженные MR" subtitle={subtitle} />

      <PageSection>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <MetricCard
              label="Всего вмержено за период"
              value={q.data?.total ?? 0}
              icon={<GitMerge size={18} />}
              loading={state.status === 'loading'}
            />
          </Col>
        </Row>
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]} align="stretch">
          <Col xs={24} xl={12}>
            <SectionCard title="По авторам" icon={<GitMerge size={18} />}>
              <DataTable<MergedMrByAuthor>
                data={q.data?.authors ?? null}
                status={state.status}
                error={state.error}
                onRetry={() => void q.refetch()}
                columns={columns}
                rowKey={(a) => a.email}
                emptyTitle="Нет вмерженных MR"
                emptyDescription="За выбранный период у команды нет вмерженных MR."
              />
            </SectionCard>
          </Col>
          <Col xs={24} xl={12}>
            <SectionCard title="По репозиториям" icon={<FolderGit2 size={18} />}>
              <DataTable<MergedMrByRepo>
                data={q.data?.byRepo ?? null}
                status={state.status}
                error={state.error}
                onRetry={() => void q.refetch()}
                columns={repoColumns}
                rowKey={(r) => r.repo}
                emptyTitle="Нет вмерженных MR"
                emptyDescription="За выбранный период у команды нет вмерженных MR."
              />
            </SectionCard>
          </Col>
        </Row>
      </PageSection>
    </>
  );
}
