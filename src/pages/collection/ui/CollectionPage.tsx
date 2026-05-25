import { useCallback } from 'react';
import { Col, Row } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { PageHeader, PageSection } from '@/shared/ui';
import { useDocumentTitle, useApiErrorNotification } from '@/shared/hooks';
import { useCollectionStore } from '@/entities/collection-run';
import { CurrentRunCard } from '@/widgets/collection-current-run';
import { CollectionTriggerCard } from '@/widgets/collection-trigger';
import { KaitenSyncCard } from '@/widgets/collection-kaiten-sync';

export function CollectionPage() {
  useDocumentTitle('Сбор данных');

  const { lastRun, kaitenSync } = useCollectionStore(
    useShallow((s) => ({ lastRun: s.lastRun, kaitenSync: s.kaitenSync })),
  );
  const refresh = useCollectionStore((s) => s.refresh);

  useApiErrorNotification(lastRun.error, 'Сбор завершился ошибкой');
  useApiErrorNotification(kaitenSync.error, 'Синхронизация Kaiten не удалась');

  const handleRefresh = useCallback(
    (id: string) => {
      void refresh(id);
    },
    [refresh],
  );

  return (
    <>
      <PageHeader
        title="Сбор данных"
        subtitle="Управление циклом сбора git + Kaiten"
      />

      <PageSection>
        <CurrentRunCard state={lastRun} onRefresh={handleRefresh} />
      </PageSection>

      <PageSection>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <CollectionTriggerCard />
          </Col>
          <Col xs={24} xl={10}>
            <KaitenSyncCard />
          </Col>
        </Row>
      </PageSection>
    </>
  );
}
