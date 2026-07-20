import { useMemo } from 'react';
import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DefectsByPeriodResponse, PeriodDefects, PriorityCounts } from '@/entities/stats';
import { formatRange } from '@/shared/lib';
import { PRIORITIES } from '../lib/priorities';

interface DefectsResultTableProps {
  data: DefectsByPeriodResponse;
}

/** Ключ строки — по индексу: периоды могут совпадать/пересекаться, id у них нет. */
const rowKey = (_: PeriodDefects, index?: number): string => `period-${index}`;

/**
 * Таблица результатов: строка на период, колонка на приоритет + «Всего». Внизу —
 * итоговая строка (сумма по всем периодам). Дефекты уникальны в пределах периода
 * (дедуп на бэке), но между пересекающимися периодами один дефект может учитываться
 * в каждом — итог по колонке это отражает как сумму периодов.
 */
export function DefectsResultTable({ data }: DefectsResultTableProps) {
  const totals = useMemo<PriorityCounts & { total: number; aiAgent: number }>(() => {
    const acc = { critical: 0, high: 0, medium: 0, low: 0, unknown: 0, total: 0, aiAgent: 0 };
    for (const p of data.periods) {
      for (const { key } of PRIORITIES) acc[key] += p.byPriority[key];
      acc.total += p.total;
      acc.aiAgent += p.aiAgentCount;
    }
    return acc;
  }, [data.periods]);

  const columns: ColumnsType<PeriodDefects> = [
    {
      title: 'Период',
      dataIndex: 'from',
      key: 'period',
      fixed: 'left',
      width: 220,
      render: (_, row) => <Typography.Text strong>{formatRange(row.from, row.to)}</Typography.Text>,
    },
    ...PRIORITIES.map((p) => ({
      title: <Tag color={p.color}>{p.label}</Tag>,
      key: p.key,
      align: 'center' as const,
      width: 120,
      render: (_: unknown, row: PeriodDefects) => {
        const n = row.byPriority[p.key];
        return n > 0 ? n : <Typography.Text type="secondary">0</Typography.Text>;
      },
    })),
    {
      title: 'Всего',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 100,
      render: (total: number) => <Typography.Text strong>{total}</Typography.Text>,
    },
    {
      title: <Tag color="var(--ant-color-primary)">AI-Agent</Tag>,
      key: 'aiAgent',
      align: 'center',
      width: 120,
      render: (_: unknown, row: PeriodDefects) => {
        if (row.total === 0) return <Typography.Text type="secondary">0</Typography.Text>;
        const pct = Math.round((row.aiAgentCount / row.total) * 100);
        return (
          <Typography.Text>
            {row.aiAgentCount} <Typography.Text type="secondary">({pct}%)</Typography.Text>
          </Typography.Text>
        );
      },
    },
  ];

  return (
    <Table<PeriodDefects>
      dataSource={data.periods}
      columns={columns}
      rowKey={rowKey}
      pagination={false}
      size="middle"
      scroll={{ x: 'max-content' }}
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <Typography.Text strong>Итого по всем периодам</Typography.Text>
            </Table.Summary.Cell>
            {PRIORITIES.map((p, i) => (
              <Table.Summary.Cell key={p.key} index={i + 1} align="center">
                <Typography.Text strong>{totals[p.key]}</Typography.Text>
              </Table.Summary.Cell>
            ))}
            <Table.Summary.Cell index={PRIORITIES.length + 1} align="right">
              <Typography.Text strong>{totals.total}</Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={PRIORITIES.length + 2} align="center">
              <Typography.Text strong>
                {totals.aiAgent}
                {totals.total > 0 && ` (${Math.round((totals.aiAgent / totals.total) * 100)}%)`}
              </Typography.Text>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );
}
