import { Button, DatePicker, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { Plus, Trash2 } from 'lucide-react';

const { RangePicker } = DatePicker;

export interface PeriodRow {
  id: string;
  range: [Dayjs, Dayjs] | null;
}

interface PeriodListEditorProps {
  periods: PeriodRow[];
  maxPeriods: number;
  disabled?: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, range: [Dayjs, Dayjs] | null) => void;
}

/**
 * Редактор списка периодов: 1..{@link maxPeriods} диапазонов дат. Каждый — RangePicker;
 * удалить можно, пока период не единственный. Полностью контролируемый — состояние держит
 * страница (нужно для сборки payload и сохранения результатов при ре-сабмите).
 */
export function PeriodListEditor({
  periods,
  maxPeriods,
  disabled = false,
  onAdd,
  onRemove,
  onChange,
}: PeriodListEditorProps) {
  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {periods.map((row, index) => (
        <Space key={row.id} size={8} align="center" wrap>
          <Typography.Text type="secondary" style={{ width: 82, display: 'inline-block' }}>
            Период {index + 1}
          </Typography.Text>
          <RangePicker
            value={row.range}
            onChange={(values) =>
              onChange(row.id, values?.[0] && values?.[1] ? [values[0], values[1]] : null)
            }
            disabled={disabled}
            format="D MMM YYYY"
            placeholder={['Начало', 'Конец']}
            allowClear={false}
            style={{ minWidth: 280 }}
          />
          <Button
            type="text"
            icon={<Trash2 size={16} />}
            aria-label={`Удалить период ${index + 1}`}
            disabled={disabled || periods.length <= 1}
            onClick={() => onRemove(row.id)}
          />
        </Space>
      ))}
      <Button
        type="dashed"
        icon={<Plus size={16} />}
        onClick={onAdd}
        disabled={disabled || periods.length >= maxPeriods}
      >
        Добавить период {periods.length >= maxPeriods && `(максимум ${maxPeriods})`}
      </Button>
    </Space>
  );
}
