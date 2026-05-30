import type { SharedComponents } from '@/shared/api/generated';

type Schemas = SharedComponents['schemas'];

/**
 * Backend: shared.yaml#/components/schemas/CollectionRun
 */
export type CollectionRun = Schemas['CollectionRun'];

export type CollectionRunStatus = CollectionRun['status'];

/**
 * Backend: shared.yaml#/components/schemas/CollectionRunRequest
 */
export type TriggerCollectionPayload = Schemas['CollectionRunRequest'];

/**
 * Backend: shared.yaml#/components/schemas/KaitenSyncResponse
 */
export type KaitenSyncResult = Schemas['KaitenSyncResponse'];
