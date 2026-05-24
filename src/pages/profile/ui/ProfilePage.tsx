import { Card, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';

export function ProfilePage() {
  const { email } = useParams<{ email: string }>();
  const decoded = email ? decodeURIComponent(email) : null;
  useDocumentTitle(decoded ? `Профиль · ${decoded}` : 'Профиль');

  return (
    <>
      <PageHeader title="Профиль" subtitle={decoded ?? 'Разработчик не выбран'} />
      <Card variant="borderless">
        <Typography.Text type="secondary">
          Карточка профиля, агрегация и Kaiten-карточки — следующий этап.
        </Typography.Text>
      </Card>
    </>
  );
}
