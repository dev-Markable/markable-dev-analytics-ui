import type { Schemas } from '@/shared/api/schema';

/**
 * Команда — first-class сущность с лидом и участниками.
 * Backend: teams-contract / shared.yaml#/components/schemas/Team
 */
export type Team = Schemas['Team'];

/** Тело запроса PUT /teams/lead. */
export type SetTeamLeadRequest = Schemas['SetTeamLeadRequest'];
