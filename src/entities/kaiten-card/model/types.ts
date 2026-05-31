import type { Schemas } from '@/shared/api/schema';

/**
 * Backend: shared.yaml#/components/schemas/KaitenCard
 */
export type KaitenCard = Schemas['KaitenCard'];

export type KaitenCardType = KaitenCard['cardType'];
export type KaitenColumnStatus = KaitenCard['columnStatus'];
