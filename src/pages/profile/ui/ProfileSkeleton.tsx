import { Skeleton } from 'antd';
import { PageSection } from '@/shared/ui';

/**
 * Каркас профиля на время загрузки.
 *
 * Раньше здесь был спиннер с подписью «Загружаем профиль» посреди пустой страницы:
 * первая секунда каждого захода выглядела как пустота, а появление данных сдвигало
 * весь макет. Скелетон повторяет структуру страницы, поэтому переход к данным —
 * замена содержимого, а не перекладка вёрстки.
 */
export function ProfileSkeleton() {
  return (
    <div className="profile-skeleton" aria-busy="true" aria-label="Загружаем профиль">
      <PageSection>
        <div className="profile-skeleton__hero">
          <Skeleton avatar={{ size: 64 }} title={{ width: 220 }} paragraph={{ rows: 2 }} active />
          <div className="profile-skeleton__stats">
            {[0, 1, 2].map((i) => (
              <Skeleton.Button key={i} active block className="profile-skeleton__stat" />
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="profile-skeleton__tiles">
          {[0, 1, 2].map((i) => (
            <Skeleton.Node key={i} active className="profile-skeleton__tile" />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="profile-skeleton__charts">
          <Skeleton.Node active className="profile-skeleton__chart" />
          <Skeleton.Node active className="profile-skeleton__chart profile-skeleton__chart--side" />
        </div>
      </PageSection>
    </div>
  );
}
