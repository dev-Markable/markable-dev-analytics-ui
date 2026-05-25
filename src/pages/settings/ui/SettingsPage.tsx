import { PageHeader, PageSection } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';
import { AppearanceCard } from '@/widgets/settings-appearance';
import { FiltersCard } from '@/widgets/settings-filters';
import { SystemCard } from '@/widgets/settings-system';

export function SettingsPage() {
  useDocumentTitle('Настройки');

  return (
    <>
      <PageHeader title="Настройки" subtitle="Параметры интерфейса и фильтрации" />

      <PageSection>
        <AppearanceCard />
      </PageSection>

      <PageSection>
        <FiltersCard />
      </PageSection>

      <PageSection>
        <SystemCard />
      </PageSection>
    </>
  );
}
