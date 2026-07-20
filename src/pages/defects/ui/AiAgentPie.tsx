import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Typography } from 'antd';
import { EmptyState } from '@/shared/ui';

interface AiAgentPieProps {
  /** Дефектов с проставленной галкой AI-Agent (сумма по всем периодам). */
  withAi: number;
  /** Всего уникальных дефектов (сумма total по периодам). */
  total: number;
}

const COLORS = {
  ai: 'var(--ant-color-primary)',
  rest: 'var(--ant-color-fill-secondary)',
} as const;

/**
 * Доля дефектов с галкой «AI-Agent» — донат «С AI-агентом / Без» с процентом в центре.
 * Агрегат по всем периодам результата (проценты по объединённому множеству).
 */
export function AiAgentPie({ withAi, total }: AiAgentPieProps) {
  if (total <= 0) {
    return <EmptyState title="Нет дефектов" description="Считать долю AI-агента не из чего." />;
  }

  const rest = Math.max(0, total - withAi);
  const pct = Math.round((withAi / total) * 100);
  const data = [
    { name: 'С AI-агентом', value: withAi, color: COLORS.ai },
    { name: 'Без', value: rest, color: COLORS.rest },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="90%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={1}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}`, name]}
              contentStyle={{
                background: 'var(--ant-color-bg-elevated)',
                border: '1px solid var(--ant-color-border)',
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography.Title level={2} style={{ margin: 0, lineHeight: 1 }}>
            {pct}%
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            с AI-агентом
          </Typography.Text>
        </div>
      </div>
      <Typography.Text type="secondary">
        {withAi} из {total} дефектов
      </Typography.Text>
    </div>
  );
}
