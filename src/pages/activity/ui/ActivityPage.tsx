import { Card } from 'antd';
import { PageHeader } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';

export function ActivityPage() {
  useDocumentTitle('Активность');
  return (
    <>
      <PageHeader title="Активность" subtitle="Дневная разбивка по разработчикам и репозиториям" />
      <Card variant="borderless">
        <p style={{ margin: 0, color: 'var(--ant-color-text-secondary)' }}>
          Heatmap и временная шкала — следующий этап.
        </p>
      </Card>
    </>
  );
}
