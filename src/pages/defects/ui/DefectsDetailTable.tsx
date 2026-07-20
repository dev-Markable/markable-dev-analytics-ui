import { useMemo, useState } from 'react';
import { Avatar, Button, Space, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { ExternalLink, Sparkles } from 'lucide-react';
import type { DefectItem } from '@/entities/stats';
import { UserAvatar } from '@/entities/user';
import { formatDate } from '@/shared/lib';

interface DefectsDetailTableProps {
  defects: DefectItem[];
  /** Можно ли проставлять AI-Agent (ADMIN/TEAMLEAD). Без прав — таблица read-only. */
  canMark: boolean;
  /** Идёт простановка (блокирует кнопки). */
  marking: boolean;
  /** Проставить флаг AI-Agent карточкам (set-only). */
  onMark: (cardIds: number[]) => Promise<void>;
}

/**
 * Детальная таблица дефектов: название, ссылка на Kaiten, участники (аватарки «кто был»),
 * признак AI-агента (с фильтром), дата создания. Для elevated — простановка AI-агента
 * построчно, по выбранным (чекбоксы) или всем без флага.
 */
export function DefectsDetailTable({ defects, canMark, marking, onMark }: DefectsDetailTableProps) {
  const [selected, setSelected] = useState<number[]>([]);

  const nonAiIds = useMemo(
    () => defects.filter((d) => !d.aiAgent).map((d) => d.id),
    [defects],
  );

  // Опции фильтра «Участники» — уникальные резолвнутые участники по всем дефектам.
  const memberFilters = useMemo(() => {
    const byEmail = new Map<string, string>();
    for (const d of defects) {
      for (const m of d.members) {
        if (m.email) byEmail.set(m.email, m.displayName ?? m.email);
      }
    }
    return [...byEmail.entries()]
      .map(([value, text]) => ({ text, value }))
      .sort((a, b) => a.text.localeCompare(b.text));
  }, [defects]);

  const mark = async (ids: number[]) => {
    if (ids.length === 0) return;
    await onMark(ids);
    setSelected((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const rowSelection: TableRowSelection<DefectItem> | undefined = canMark
    ? {
        selectedRowKeys: selected,
        onChange: (keys) => setSelected(keys.map(Number)),
        // Уже отмеченные — снять нельзя (set-only), чекбокс не нужен.
        getCheckboxProps: (d) => ({ disabled: d.aiAgent }),
      }
    : undefined;

  const columns: ColumnsType<DefectItem> = [
    {
      title: 'Дефект',
      dataIndex: 'title',
      key: 'title',
      width: 640,
      render: (title: string) => (
        <Typography.Text style={{ maxWidth: 620, display: 'block' }} ellipsis={{ tooltip: title }}>
          {title}
        </Typography.Text>
      ),
    },
    {
      title: 'Kaiten',
      dataIndex: 'url',
      key: 'url',
      width: 90,
      align: 'center',
      render: (url: string | null | undefined) =>
        url ? (
          <Typography.Link href={url} target="_blank" rel="noreferrer" aria-label="Открыть в Kaiten">
            <ExternalLink size={16} />
          </Typography.Link>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Участники',
      dataIndex: 'members',
      key: 'members',
      width: 200,
      filters: memberFilters,
      filterSearch: true,
      onFilter: (value, row) => row.members.some((m) => m.email === value),
      render: (members: DefectItem['members']) =>
        members.length === 0 ? (
          <Typography.Text type="secondary">—</Typography.Text>
        ) : (
          <Avatar.Group max={{ count: 6 }} size={28}>
            {members.map((m, i) => (
              <Tooltip key={m.email ?? i} title={m.displayName ?? m.email ?? 'Без имени'}>
                <span>
                  <UserAvatar
                    user={{
                      email: m.email ?? '',
                      name: m.displayName ?? null,
                      username: null,
                      avatarUrl: m.avatarUrl ?? null,
                    }}
                    size={28}
                  />
                </span>
              </Tooltip>
            ))}
          </Avatar.Group>
        ),
    },
    {
      title: 'AI-Agent',
      dataIndex: 'aiAgent',
      key: 'aiAgent',
      width: 140,
      align: 'center',
      filters: [
        { text: 'С AI-агентом', value: true },
        { text: 'Без AI-агента', value: false },
      ],
      onFilter: (value, row) => row.aiAgent === value,
      render: (aiAgent: boolean, row) =>
        aiAgent ? (
          <Tag color="var(--ant-color-primary)" icon={<Sparkles size={12} />}>
            AI
          </Tag>
        ) : canMark ? (
          <Button
            size="small"
            icon={<Sparkles size={13} />}
            disabled={marking}
            onClick={() => void mark([row.id])}
          >
            Отметить
          </Button>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Создан',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      defaultSortOrder: 'descend',
      render: (createdAt: string) => formatDate(createdAt),
    },
  ];

  return (
    <>
      {canMark && (
        <Space style={{ marginBottom: 12 }} wrap>
          <Button
            type="primary"
            icon={<Sparkles size={14} />}
            loading={marking}
            disabled={selected.length === 0}
            onClick={() => void mark(selected)}
          >
            Отметить выбранные{selected.length > 0 ? ` (${selected.length})` : ''}
          </Button>
          <Button
            icon={<Sparkles size={14} />}
            loading={marking}
            disabled={nonAiIds.length === 0}
            onClick={() => void mark(nonAiIds)}
          >
            Отметить все без AI ({nonAiIds.length})
          </Button>
        </Space>
      )}
      <Table<DefectItem>
        dataSource={defects}
        columns={columns}
        rowKey={(d) => d.id}
        rowSelection={rowSelection}
        size="middle"
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 20,
          pageSizeOptions: [10, 20, 50, 100],
          showSizeChanger: true,
          showTotal: (t) => `${t} дефектов`,
        }}
      />
    </>
  );
}
