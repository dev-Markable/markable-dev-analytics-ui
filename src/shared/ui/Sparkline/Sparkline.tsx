import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  /** Ряд значений по времени (слева направо). */
  data: readonly number[];
  /** Цвет линии/заливки. По умолчанию primary темы. */
  color?: string;
  height?: number;
}

/**
 * Минимальный спарклайн: area без осей, сетки, тултипа и точек.
 * Тянется по ширине контейнера. Цвет — через CSS-переменную, поэтому
 * автоматически адаптируется к light/dark.
 */
export function Sparkline({
  data,
  color = 'var(--ant-color-primary)',
  height = 32,
}: SparklineProps) {
  // useId — уникальный id градиента, иначе несколько спарклайнов на странице
  // переиспользуют один <defs> и красятся одинаково/глючно.
  const gradientId = `spark-${useId().replace(/:/g, '')}`;

  if (data.length < 2) {
    // одна точка — линию не построить, рисуем пустоту нужной высоты
    return <div style={{ height }} aria-hidden />;
  }

  const points = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.75}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
