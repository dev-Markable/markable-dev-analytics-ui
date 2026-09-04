import { useId } from 'react';
import { Area, AreaChart, ReferenceDot, ReferenceLine, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  /** Ряд значений по времени (слева направо). */
  data: readonly number[];
  /** Цвет линии/заливки. По умолчанию primary темы. */
  color?: string;
  height?: number;
}

/**
 * Минимальный спарклайн: area без осей, сетки и тултипа.
 * Тянется по ширине контейнера. Цвет — через CSS-переменную, поэтому
 * автоматически адаптируется к light/dark.
 *
 * Из ориентировки — только две вещи: пунктир на минимуме ряда (глазу нужно
 * «пол», иначе рост ни с чем не сравнить) и залитая точка на последнем
 * значении (где мы сейчас). Остальное — шум.
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
  const min = Math.min(...data);
  const last = points[points.length - 1];
  if (!last) return <div style={{ height }} aria-hidden />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {/* Поля — чтобы точка последнего значения не обрезалась кромкой контейнера. */}
      <AreaChart data={points} margin={{ top: 3, right: 3, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {min > 0 && (
          <ReferenceLine
            y={min}
            stroke="var(--ant-color-border-secondary)"
            strokeDasharray="2 3"
            strokeWidth={1}
          />
        )}
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.75}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          dot={false}
        />
        <ReferenceDot
          x={last.index}
          y={last.value}
          r={2.5}
          fill={color}
          stroke="var(--ant-color-bg-container)"
          strokeWidth={1}
          isFront
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
