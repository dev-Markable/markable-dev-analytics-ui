export const APP_NAME = 'DevPulse';
export const APP_SHORT_NAME = 'DevPulse';

export const DEFAULT_PAGE_SIZE = 50;
export const COMMITS_MAX_PAGE_SIZE = 500;

export const DASHBOARD_PAGE_SIZE = 10;

export const NOTIFICATION_DURATION_S = 4.5;
export const COLLECTION_POLL_INTERVAL_MS = 2_000;
export const COLLECTION_POLL_TIMEOUT_MS = 5 * 60 * 1_000;

export const DEFAULT_DEBOUNCE_MS = 300;

/**
 * TTL кэша сторов: при возврате на страницу не передёргиваем API, если данные
 * за тот же период загружены недавно. 60 сек — баланс свежести и числа запросов.
 */
export const STORE_CACHE_TTL_MS = 60_000;
