export type KaitenCardType = 'DEVELOPMENT' | 'DEFECT' | 'OTHER';
export type KaitenColumnStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'UNKNOWN';

export interface KaitenCard {
  id: number;
  title: string;
  description: string | null;

  /** Сырой type_id из Kaiten API. */
  typeId: number;
  /** Наша классификация: DEVELOPMENT (70) / DEFECT (8) / OTHER. */
  cardType: KaitenCardType;

  /** Сырой код колонки (1/2/3). */
  columnType: number;
  /** Derived: NEW=1, IN_PROGRESS=2, DONE=3, UNKNOWN=прочее. */
  columnStatus: KaitenColumnStatus;
  /** Человекочитаемое название колонки («В уточнении», «Готово к ревью»). */
  columnTitle: string;

  boardName: string | null;
  spaceName: string | null;
  ownerId: number | null;
  ownerName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  closedAt: string | null;

  /** Карточка скрыта с доски. НЕ значит что задача завершена. */
  archived: boolean;
  /** Derived: columnStatus == DONE ИЛИ closedAt != null. Источник правды о «закрыта/нет». */
  closed: boolean;

  url: string | null;
  memberIds: number[];
}
