export interface KaitenCard {
  id: number;
  title: string;
  description: string | null;
  status: string | null;
  columnName: string | null;
  boardName: string | null;
  spaceName: string | null;
  ownerId: number | null;
  ownerName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  closedAt: string | null;
  archived: boolean;
  url: string | null;
  memberIds: number[];
}
