import { Card } from 'antd';
import { PageHeader } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';
import { useDateRange } from '@/features/date-range-filter';
import { formatRange } from '@/shared/lib';

export function DashboardPage() {
  useDocumentTitle('Дашборд');
  const range = useDateRange();

  return (
    <>
      <PageHeader
        title="Дашборд"
        subtitle={`Топ активных и аутсайдеры · ${formatRange(range.from, range.to)}`}
      />
      <Card variant="borderless">
        <p style={{ margin: 0, color: 'var(--ant-color-text-secondary)' }}>
          Реализация дашборда подключается на следующем этапе.
        </p>
      </Card>
    </>
  );
}
