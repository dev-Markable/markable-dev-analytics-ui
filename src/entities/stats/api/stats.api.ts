import { apiClient } from '@/shared/api';
import type {
  DailyStat,
  DefectsByPeriodRequest,
  DefectsByPeriodResponse,
  HourlyStats,
  MarkDefectsAiAgentResponse,
  MergedMrStats,
  PeriodSummary,
  ReviewStats,
  WeeklyStat,
} from '../model/types';

export interface PeriodQuery {
  from: string;
  to: string;
}

/**
 * Hourly поддерживает опциональные независимые фильтры: по автору (профиль)
 * и по команде (страница «Активность»). Оба сериализуются в query как есть;
 * `undefined` axios опускает.
 */
export interface HourlyQuery extends PeriodQuery {
  email?: string;
  team?: string;
}

/**
 * Все эндпоинты принимают опциональный AbortSignal — TanStack Query
 * прокидывает его через `queryFn({ signal })` и отменяет устаревший fetch
 * при смене ключа (период/автор) или unmount страницы. См. `shared/api/abort.ts`.
 */

export async function getSummary(query: PeriodQuery, signal?: AbortSignal): Promise<PeriodSummary> {
  const { data } = await apiClient.get<PeriodSummary>('/stats/summary', { params: query, signal });
  return data;
}

export async function getWeekly(query: PeriodQuery, signal?: AbortSignal): Promise<WeeklyStat[]> {
  const { data } = await apiClient.get<WeeklyStat[]>('/stats/weekly', { params: query, signal });
  return data;
}

export async function getDaily(query: PeriodQuery, signal?: AbortSignal): Promise<DailyStat[]> {
  const { data } = await apiClient.get<DailyStat[]>('/stats/daily', { params: query, signal });
  return data;
}

export async function getHourly(query: HourlyQuery, signal?: AbortSignal): Promise<HourlyStats> {
  const { data } = await apiClient.get<HourlyStats>('/stats/hourly', { params: query, signal });
  return data;
}

export async function getReviews(query: PeriodQuery, signal?: AbortSignal): Promise<ReviewStats> {
  const { data } = await apiClient.get<ReviewStats>('/stats/reviews', { params: query, signal });
  return data;
}

/**
 * Дефекты команды по приоритету за 1..10 периодов. POST (тело — команда + периоды):
 * периоды задаёт пользователь на форме и явно сабмитит, поэтому это мутация, а не
 * query по URL-фильтрам. Бэк дедуплицирует дефекты по id карточки.
 *
 * Бэк тянет карточки живьём из Kaiten по всем участникам команды — это МИНУТЫ
 * (наблюдалось ~4 мин на команду в 10 человек / 2.5k карточек). Поэтому дефолтный
 * 30s-таймаут клиента переопределяем на длинный (как в syncKaitenUsers). POST → axios-retry
 * его не ретраит, так что 4-минутный Kaiten-стрим не запустится повторно.
 */
const DEFECTS_TIMEOUT_MS = 6 * 60 * 1000;

export async function getTeamDefects(
  body: DefectsByPeriodRequest,
  signal?: AbortSignal,
): Promise<DefectsByPeriodResponse> {
  const { data } = await apiClient.post<DefectsByPeriodResponse>('/stats/defects', body, {
    signal,
    timeout: DEFECTS_TIMEOUT_MS,
  });
  return data;
}

/** Merged-MR запрос: период (глобальный фильтр) + обязательная команда. */
export interface MergedMrQuery extends PeriodQuery {
  team: string;
}

export async function getMergedMrs(query: MergedMrQuery, signal?: AbortSignal): Promise<MergedMrStats> {
  const { data } = await apiClient.get<MergedMrStats>('/stats/merged-mrs', { params: query, signal });
  return data;
}

/**
 * Проставить дефектам флаг «AI-Agent» в Kaiten (id_6064=true). Set-only, только ADMIN/TEAMLEAD.
 * Kaiten пишется ~4 карточки/сек (глобальный rate-limit) — для bulk нужен длинный таймаут.
 */
const MARK_AI_TIMEOUT_MS = 6 * 60 * 1000;

export async function markDefectsAiAgent(cardIds: number[]): Promise<MarkDefectsAiAgentResponse> {
  const { data } = await apiClient.post<MarkDefectsAiAgentResponse>(
    '/stats/defects/ai-agent',
    { cardIds },
    { timeout: MARK_AI_TIMEOUT_MS },
  );
  return data;
}
