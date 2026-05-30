import type { SharedComponents } from '@/shared/api/generated';

/**
 * Backend: shared.yaml#/components/schemas/KaitenCard
 */
export type KaitenCard = SharedComponents['schemas']['KaitenCard'];

export type KaitenCardType = KaitenCard['cardType'];
export type KaitenColumnStatus = KaitenCard['columnStatus'];
