/**
 * Барелл сгенеренных OpenAPI-типов из devpulse-oas.
 *
 * Каждый контракт самодостаточен — `$ref: shared.yaml#/...` инлайнятся
 * в каждый файл при генерации, поэтому общие схемы продублированы.
 * Для наших entity-типов используем `SharedComponents['schemas']['X']` как
 * канонический источник, а `*Components` под конкретные эндпоинты —
 * для response-форм (DashboardResponse, UserProfileResponse).
 *
 * НЕ РЕДАКТИРОВАТЬ напрямую файлы в этой папке — пересоздаются через
 * `npm run gen:api` из локального чекаута devpulse-oas.
 */
export type { components as SharedComponents } from './shared';
export type { components as CollectionComponents } from './collection';
export type { components as DashboardComponents } from './dashboard';
export type { components as StatsComponents } from './stats';
export type { components as UsersComponents } from './users';
export type { components as KaitenComponents } from './kaiten';
