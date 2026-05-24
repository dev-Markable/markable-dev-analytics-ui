import { Card } from 'antd';
import { PageHeader } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';

export function CollectionPage() {
  useDocumentTitle('Сбор данных');
  return (
    <>
      <PageHeader title="Сбор данных" subtitle="Запуск и журнал прогонов" />
      <Card variant="borderless">
        <p style={{ margin: 0, color: 'var(--ant-color-text-secondary)' }}>
          Триггер сбора и журнал — следующий этап.
        </p>
      </Card>
    </>
  );
}
