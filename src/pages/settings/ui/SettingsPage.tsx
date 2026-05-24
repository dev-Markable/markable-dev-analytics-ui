import { Card, Space, Typography } from 'antd';
import { PageHeader, PageSection } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';
import { ThemeSwitch } from '@/features/theme-switch';
import { TeamFilterToggle } from '@/features/team-filter';

export function SettingsPage() {
  useDocumentTitle('Настройки');
  return (
    <>
      <PageHeader title="Настройки" subtitle="Параметры интерфейса и фильтрации" />

      <PageSection title="Внешний вид" description="Тема оформления приложения">
        <Card variant="borderless">
          <Space align="center" size={16}>
            <Typography.Text>Тема</Typography.Text>
            <ThemeSwitch />
          </Space>
        </Card>
      </PageSection>

      <PageSection
        title="Фильтрация"
        description="Глобальный фильтр для отображения только участников команды"
      >
        <Card variant="borderless">
          <TeamFilterToggle />
        </Card>
      </PageSection>
    </>
  );
}
