import { Col, Row } from 'antd';
import { PageHeader, PageSection } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks';
import { CurrentRunCard } from '@/widgets/collection/current-run';
import { CollectionTriggerCard } from '@/widgets/collection/trigger';
import { KaitenSyncCard } from '@/widgets/collection/kaiten-sync';

export function CollectionPage() {
  useDocumentTitle('Сбор данных');

  return (
    <>
      <PageHeader
        title="Сбор данных"
        subtitle="Управление циклом сбора git + Kaiten"
      />

      <PageSection>
        <CurrentRunCard />
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
