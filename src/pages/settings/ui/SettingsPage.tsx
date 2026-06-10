import { PageHeader, PageSection } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';
import { AppearanceCard } from '@/widgets/settings/appearance';
import { SystemCard } from '@/widgets/settings/system';

export function SettingsPage() {
  useDocumentTitle('Настройки');

  return (
    <>
      <PageHeader
        title="Настройки"
        subtitle="Параметры интерфейса и системная информация. Управление командами — на странице «Команды»."
      />

      <PageSection>
        <AppearanceCard />
      </PageSection>

      <PageSection>
        <SystemCard />
      </PageSection>
    </>
  );
}
