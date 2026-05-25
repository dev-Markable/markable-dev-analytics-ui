import { Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { ROUTES } from '@/app/router/paths';

export function NotFoundPage() {
  useDocumentTitle('Страница не найдена');
  return (
    <div className="state-block" style={{ minHeight: '60vh' }}>
      <div className="state-block__icon">
        <Compass size={28} strokeWidth={1.5} />
      </div>
      <Typography.Title level={3} className="state-block__title">
        Страница не найдена
      </Typography.Title>
      <Typography.Text type="secondary" className="state-block__description">
        URL, по которому вы перешли, не существует. Возможно, ссылка устарела.
      </Typography.Text>
      <div className="state-block__action">
        <Link to={ROUTES.dashboard}>
          <Button type="primary">На дашборд</Button>
        </Link>
      </div>
    </div>
  );
}
