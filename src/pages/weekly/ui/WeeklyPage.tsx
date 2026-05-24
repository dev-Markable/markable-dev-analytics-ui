import { Card } from 'antd';
import { PageHeader } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';

export function WeeklyPage() {
  useDocumentTitle('Недели');
  return (
    <>
      <PageHeader title="Недельная статистика" subtitle="ISO-недели с разбивкой по авторам" />
      <Card variant="borderless">
        <p style={{ margin: 0, color: 'var(--ant-color-text-secondary)' }}>
          График и таблица недель — следующий этап.
        </p>
      </Card>
    </>
  );
}
