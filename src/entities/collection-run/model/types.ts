export type CollectionRunStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface CollectionRun {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  sinceDate: string;
  untilDate: string | null;
  status: CollectionRunStatus;
  errorMessage: string | null;
}

export interface TriggerCollectionPayload {
  since?: string | null;
}

export interface KaitenSyncResult {
  synced: number;
}
