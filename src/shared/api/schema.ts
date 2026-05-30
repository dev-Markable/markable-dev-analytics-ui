/**
 * Барелл OpenAPI-типов из npm-пакета `@devpulse-dev/api-types`.
 *
 * Пакет публикуется из devpulse-oas (GitHub Packages) и содержит готовые `.d.ts`
 * на весь `/api/v2` — единый `components`/`paths`/`operations`, без codegen на
 * нашей стороне. Версия пинится в package.json (`@devpulse-dev/api-types`),
 * в lockstep с Maven-контрактами бэка.
 *
 * Все entity-типы (`AuthorActivity`, `KaitenCard`, …) — алиасы на схемы отсюда.
 */
import type { components, paths } from '@devpulse-dev/api-types';

export type Schemas = components['schemas'];
export type ApiPaths = paths;

// Re-export неймспейсов на случай прямого доступа к paths/operations.
export type { components, paths, operations } from '@devpulse-dev/api-types';
