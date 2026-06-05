# DevPulse — фронт

[![CI](https://github.com/devpulse-dev/devpulse-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/devpulse-dev/devpulse-ui/actions/workflows/ci.yml)

Аналитика активности разработчиков: дашборд с activity-score, недельная динамика,
профили, heatmap-календарь, сравнение, bus factor, ревью-метрики, **Performance
Review** (досье к 1:1), **управление командами и лидами**, экспорт.
Бэк — [`DevPulse-core`](../DevPulse-core), API v2 (REST + RFC 7807 problem+json),
контракт `@devpulse-dev/api-types ^1.7.0`.

> Дорожная карта фич и прогресс — в [`FEATURES.md`](./FEATURES.md).

---

## Стек

| Слой | Технология |
|---|---|
| UI | React 19 + TypeScript (strict) |
| Сборка | Vite 5 |
| Компоненты | Ant Design 5 (`cssVar: true`, `hashed: false`) |
| Состояние | Zustand 5 (`persist` middleware) |
| Роутинг | React Router 6 (с v7 future flags) |
| HTTP | Axios + interceptor → RFC 7807 → `ApiError` |
| Графики | Recharts (темо-адаптивные через CSS variables) |
| Иконки | lucide-react |
| Даты | dayjs + `isoWeek` + ru-локаль |

---

## Быстрый старт

```bash
# Зависимости
npm install

# Dev-сервер на http://localhost:9000
# (vite проксирует /api → http://localhost:8080)
npm run dev

# Production-билд
npm run build

# Превью production-сборки
npm run preview

# Проверки (typecheck / lint / тесты)
npm run typecheck && npm run lint && npm test
```

**Требования:** Node 20+, npm 10+. Перед `npm install` нужен `GITHUB_TOKEN` с `read:packages` (см. [API-типы](#api-типы-devpulse-devapi-types)). Бэк должен быть запущен на `localhost:8080` (или поправь proxy `target` в `vite.config.ts`).

### Переменные окружения

```bash
# .env (опционально, иначе берутся дефолты)
VITE_API_BASE_URL=/api/v2          # baseURL axios-клиента; в dev — относительный, в prod может быть абсолютным
```

---

## Архитектура — Feature-Sliced Design

```
src/
├── app/        # провайдеры, router, глобальные стили
├── pages/      # роуты (Dashboard, Weekly, Activity, Compare, Performance Review,
│               #         Teams, Profile, Collection, Settings, NotFound)
├── widgets/    # самостоятельные UI-блоки (LeaderboardCard, ActivityHeatmap,
│               #         PerfKpiGrid, TeamCard, …)
├── features/   # пользовательские сценарии (theme-switch, date-range-filter, team-scope)
├── entities/   # бизнес-сущности (user, team, commit, kaiten-card, stats,
│               #         dashboard, performance-review, collection-run)
└── shared/     # api/, config/, lib/, hooks/, ui/, test/factories.ts
```

**Правило слоёв:** import только сверху вниз (`pages → widgets → features → entities → shared`). Барелл `@/app/router` грузит весь router-граф, поэтому константы (`ROUTES`, `buildProfilePath`) импортируются из `@/app/router/paths` напрямую — это избегает циклической зависимости через `widgets/app-layout`.

**Внутри slice'а:** `ui/` (компоненты), `model/` (Zustand + типы), `api/` (axios-обёртки), `lib/` (чистые утилиты), `config/` (константы, columns), `index.ts` (public API).

### Состояние

- **Filter stores** (`features/*/model/*.store.ts`) — глобальные настройки UI (`theme`, `dateRange`, `teamScope`). Persist в localStorage по ключам `devpulse.*`.
- **Entity stores** (`entities/*/model/*.store.ts`) — кэш данных с бэка. Каждый держит `AsyncState<T>` (`status`, `data`, `error`, `lastFetchedAt`).
- **Race protection.** Любой store с `fetch()` использует `createRaceGuard()` — если юзер переключит фильтр пока летит запрос, старый ответ молча игнорируется.
- **TTL-кэш навигаций.** `fetch` за тот же период в пределах `STORE_CACHE_TTL_MS` (60с) — no-op (возврат на страницу не дёргает API). Stats-сторы (weekly/daily/summary/hourly/reviews) собраны общей фабрикой `createStatsStore` (race-guard + кэш).
- **Optimistic updates.** Мутации в teams/users (assignLead, assignTeam) — точечный апдейт кэша + фоновый `fetchTeams(true)` для финальной консистентности между командами.
- **Селекторы через `useShallow`** — не реренжем компонент, если объект-выборка не изменился по структуре.
- **Фильтры в URL.** `FilterUrlSync` (`app/providers`) двусторонне синхронит `dateRange` и `teamScope` с `?from&to&team=<name>` — диплинки, закладки, кнопка «назад». Скоп `ALL_TEAMS` (по умолчанию) в URL не пишется.
- **Lazy-страницы.** Все роуты кроме стартового Dashboard — `React.lazy` + `Suspense`; recharts вынесен из инициального бандла.

### Поток данных

```
backend → entity store fetch → AsyncState<T>
                                 │
                                 ▼
                       Filter store (teamScope)
                                 │
                                 ▼ (фильтрация ДО агрегации)
                  Aggregation libs (aggregateByContributor,
                  groupCommitsByTask, applyTeamFilterToWeekly…)
                                 │
                                 ▼
                       Widget принимает чистые данные
```

**Принцип:** глобальный team-scope применяется на page-уровне ДО передачи данных в виджеты. Так все производные (totals, top-N, pagination) корректны без дополнительных запросов.

---

## Страницы

| Route | Файл | API |
|---|---|---|
| `/` Дашборд | `pages/dashboard/` | `GET /dashboard?size=500` (×2 — текущий + предыдущий период для PoP-дельт) |
| `/weekly` Недели | `pages/weekly/` | `GET /stats/weekly` |
| `/activity` Активность | `pages/activity/` | `GET /stats/daily` + `GET /stats/hourly` + `GET /stats/reviews` + `GET /dashboard` + `GET /users` (enrichment / team fallback) |
| `/compare` Сравнение | `pages/compare/` | — (из dashboard-стора, выбор в `?ids=`) |
| `/performance-review` Performance Review | `pages/performance-review/` | `GET /performance/review?email&from&to&compareToPrevious` + `GET /users` |
| `/teams` Команды | `pages/teams/` | `GET /teams`, `PUT /teams/lead`, `PUT /users/{email}/team` |
| `/users/:email` Профиль | `pages/profile/` | `GET /users/{email}/profile` |
| `/collection` Сбор | `pages/collection/` | `POST /collection/runs`, `GET /collection/runs/{id}`, `POST /kaiten/sync-users` |
| `/settings` Настройки | `pages/settings/` | — (только localStorage) |
| `*` 404 | `pages/not-found/` | — |

---

## Команды и лиды

С API 1.7.0 команды — first-class сущность.

- **`UserProfile.team`** (string|null) и **`UserProfile.isLead`** (boolean) теперь есть и в `AuthorSummary` (`/dashboard`, `/stats/summary`, `/stats/weekly`), и в `ReviewAuthor` (`/stats/reviews`) — кросс-резолв не нужен.
- **`GET /teams`** отдаёт `Team { name, lead: UserProfile|null, members: UserProfile[] }`. Источник имён для глобального пикера и экрана управления.
- **`PUT /teams/lead`** body `{ team, email|null }` — назначить / снять лида (бэк держит инвариант «один лид»).
- **`PUT /users/{email}/team`** body `{ team: string|null }` — добавить / перевести / исключить. Имя — свободный текст; новая команда появляется при первом назначении.

### Глобальный фильтр (топбар)

`features/team-scope` — единый источник правды:
- значения: `ALL_TEAMS` (по умолчанию, в URL не пишется), `NO_TEAM` («без команды»), либо имя команды;
- хук `useTeamScopeFilter(items, getTeam)` фильтрует массив по полю `team` элемента;
- `matchesScope(team, scope)` — pure-функция, легко тестируется;
- если в persisted-store сохранена пропавшая команда (переименована/удалена), `TeamScopePicker` мягко сбрасывается в `ALL_TEAMS` + info-тост.

Серверного `?team=` на `/dashboard` и `/stats/*` нет — фильтрация чисто клиентская. `GET /users?team=` используется только для picker'а в Performance Review.

### Лид-бейдж

`<UserAvatar isLead>` рисует золотую корону-overlay поверх аватара. Размер бейджа адаптивен (`leadBadgeSize`). Дополнительно `<TeamChip team>` — компактный тэг команды для строк / карточек.

---

## Тема и стилизация

- **AntD ConfigProvider** с `cssVar: true` + `hashed: false` → AntD генерирует CSS-переменные `--ant-color-*`, `--ant-box-shadow` на `:root`. Кастомный CSS читает их без хешей.
- **Light/dark** через `data-theme` атрибут на `<html>`. `:root[data-theme='dark'] .smth` — точечные оверрайды для shadow/borders.
- **Палитра:** Linear/Stripe-стиль. Page — серый/тёмный, sidebar и cards — белые/elevated. Topbar полупрозрачный с `backdrop-filter: blur` через `color-mix`.
- **Шрифты:** Inter (UI) + JetBrains Mono (хеши коммитов, теги задач) — Google Fonts.
- **Print-CSS** для `/performance-review` — скрывает sidebar/topbar/контролы, убирает тени, держит блоки `break-inside: avoid` для аккуратного PDF.

---

## Что важно знать перед изменениями

### Парсинг номера задачи Kaiten

Коммиты у нас формата `<space-id>-<task-id> message`, например `1700-3263985 fix bug`. Backend парсит **только первое число** (`1700`) — это id пространства, а не карточки. Реальный ID карточки = часть после дефиса.

Поэтому frontend парсит сам:

```ts
// entities/commit/lib/task-id.ts
const SPACE_TASK_PATTERN = /(\d+)-(\d+)/;
export const extractCardId = (commit) =>
  commit.message.match(SPACE_TASK_PATTERN)?.[2] ?? commit.taskNumber;
```

Используется везде где нужно матчить коммит с карточкой Kaiten (TasksTimeline + CommitMessage).

### Daily-эндпоинт без enrichment

`/stats/daily` возвращает `email` без `displayName`/`avatarUrl` — это намеренно (тысячи записей за период, enrichment дорогой). На `/activity` мы собираем `enrichmentByEmail` из двух источников:

1. `GET /users` — даёт `team`/`isLead` всем известным разработчикам (нужен для фильтра команды и значка лида в `ContributorsList`),
2. `GET /dashboard items` — перетирает первый источник «сверху» для top-500 (там точнее `displayName`/`avatarUrl`).

Без второго источника разработчик вне топ-500 терялся бы при фильтре по команде.

### Performance Review

Раздел `/performance-review` — досье к 1:1. Picker разработчика подхватывает глобальный team-scope из топбара (одна точка правды). Метрики (`PerformanceMetrics`) — 14 полей `MetricDelta { current, previous?, delta?, deltaPct? }`. У снапшот-метрик (`defectsInWork`, `devTasksInWork`) `previous/delta/deltaPct = null` — дельту не рисуем, ставим бейдж «снапшот». У `avgTimeToMergeHours` инвертирован тон (меньше = лучше).

Честные подписи в UI: «дефекты/задачи — по текущему состоянию карточек», «тесты — строки тест-кода, не число тестов».

### Activity score (дашборд)

`/dashboard` возвращает у каждого автора композитный `activity: ActivityScore | null`:

- `score = volumeFactor × qualityFactor` — финал, `1.0 ≈ норма команды`
- `category` — `INACTIVE` / `BELOW_AVERAGE` / `ACTIVE` / `STAR`
- `volumeFactor` — `nonMergeCommits / expected` (baseline 50 коммитов / 30 дней)
- `qualityFactor` — 0.3..1.0 от avg lines/commit (штраф за микро-коммиты и бомбы)

Сортировка дашборда — по `activity.score desc`. На weekly/summary эндпоинтах `activity = null`, на daily поля нет.

Фронт показывает `<ActivityBadge>` (`entities/user/ui/ActivityBadge.tsx`) — Tag с цветом по категории + tooltip с разбивкой компонент. Используется в `LeaderboardRow` (компактно, inline с именем) и в столбце AuthorsTable.

---

## Скрипты

```bash
npm run dev         # vite dev server :9000
npm run build       # tsc -b && vite build → dist/
npm run preview     # превью production-сборки
npm run typecheck   # tsc -b --noEmit
npm run lint        # eslint (нулевая толерантность к warning'ам)
npm test            # vitest run (unit-тесты)
npm run test:watch  # vitest в watch-режиме
npm run test:cov    # vitest с coverage-отчётом
```

---

## Тесты

Vitest (нативно с Vite). Покрыты **чистые функции** — агрегации, парсеры, store-инфра, где цена бага высока, а DOM не нужен. Тест-файлы `*.test.ts` co-located рядом с кодом.

Фабрики тестовых данных — `src/shared/test/factories.ts` (`makeAuthor`, `makeCommit`, `makeCard`, `makeDaily`, `makeWeek`, `makeActivity`). В прод-бандл не попадают.

**Сейчас 165 тестов в 24 файлах** (`npm test`).

Что покрыто:

| Модуль | Что проверяется |
|---|---|
| `shared/api/race` | `createRaceGuard`: счётчик, защита от устаревших ответов, классический race-сценарий |
| `shared/api/async-state` | `idle/loading/success/failure`, сохранение stale-data, `isFresh` (TTL-граница под `vi.useFakeTimers`) |
| `entities/commit/lib/task-id` | `extractCardId` (формат `<space>-<task>`, merge-сообщения, fallback), `stripTaskPrefix` |
| `entities/dashboard/lib/select-sections` | дизъюнктность top/outsiders по категории, worst-first, лимиты |
| `entities/dashboard/lib/aggregate` | суммирование totals, uniqueAuthors |
| `entities/user/lib/initials` | `userInitials` / `userDisplayName` / `authorAsUser` (фоллбэки, email-разделители) |
| `entities/stats/lib/apply-team-filter` | predicate-based пересчёт недельных totals под фильтр команды |
| `features/team-scope/model/team-scope` | `matchesScope`: ALL_TEAMS / NO_TEAM / конкретное имя, краевые `null`/`undefined`/`''` |
| `widgets/profile-tasks-timeline/lib/group-commits` | матчинг коммит↔карточка, orphan-группа, пустые карточки, сортировка |
| `widgets/activity-summary/lib` | totals (авторы/репо/активные дни), `dailySeries` для спарклайнов |
| `widgets/activity-bus-factor/lib` | bus factor (накопление до 50%), уровни риска, сортировка |
| `widgets/activity-contributors/lib/aggregate-contributors` | суммирование, сортировка, enrichment с team/isLead, регистронезависимость, merge-only |
| `widgets/activity-contributors/lib/detect-anomalies` | эвристики STALE / DECLINING / LOW_TESTS |
| `widgets/activity-hourly/lib/build-hourly-grid` | 7×24-сетка из `/stats/hourly`, normalize-buckets |
| `widgets/compare-radar/lib/normalize` | нормализация осей радара к лидеру |
| `widgets/profile-summary/lib/aggregate-cards` | разбивка карточек по closed × cardType |
| `widgets/profile-reviews/lib/compare` | дельта ревью-метрик к среднему команды |
| `widgets/activity-reviews/lib/reviews` | сортировка `engagement = approves + comments`, `formatHours` |
| `widgets/perf-controls/config/periods` | `presetRange` / `detectPeriodKey` (под `vi.useFakeTimers`) |
| `shared/lib/number/format` | форматтеры, `pctChange`, `formatPctDelta`, `formatHours` |
| `shared/lib/date/ranges` | `previousPeriod` (PoP), границы месяца |
| `shared/lib/export/csv` | экранирование, разделитель, заголовки |
| `shared/lib/string/truncate` | эллипсис, инициалы |

> **tsconfig:** `tsconfig.app.json` исключает тесты (в прод-build не идут),
> `tsconfig.test.json` проверяет их отдельно с послаблением `noUncheckedIndexedAccess`
> (деструктуризация массивов в ассертах идиоматична). `tsc -b` гоняет оба проекта.

---

## API-типы (`@devpulse-dev/api-types`)

Типы запросов/ответов **не генерируются у нас** — фронт ставит готовый npm-пакет
[`@devpulse-dev/api-types`](https://github.com/devpulse-dev/devpulse-oas/pkgs/npm/api-types) из GitHub Packages. Внутри — bundled `.d.ts` на весь `/api/v2` (единый `components` / `paths` / `operations`), собранный из OpenAPI-контрактов в `devpulse-oas`. Single source of truth — бэк implement'ит те же спеки, фронт импортит те же типы. Версия пакета в lockstep с Maven-контрактами (`1.x` ↔ контракты `1.x`).

**Текущая версия:** `^1.7.0` — `team`/`isLead` в `UserProfile` / `AuthorSummary` / `ReviewAuthor`, тег `Teams` (`GET /teams`, `PUT /teams/lead`), `GET /performance/review`, `GET/PUT /users[...]`.

### Доступ к GitHub Packages

`.npmrc` (коммитится, секрета внутри нет — токен берётся из env):

```ini
@devpulse-dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

GitHub Packages npm-registry требует токен **даже для публичного пакета** (в отличие от Maven). Перед `npm install`:

```bash
export GITHUB_TOKEN=ghp_xxx   # PAT с read:packages
npm install
```

> Не добавляй глобальный `registry=` в `.npmrc` — иначе react/axios/… полезут в GitHub Packages и получат 404. Только scoped-строка.

### Как использовать

Все entity-типы (`AuthorActivity`, `KaitenCard`, `Commit`, `DashboardData`, `Team`, `PerformanceReview`, …) — **алиасы на схемы из пакета**. Барелл `src/shared/api/schema.ts`:

```ts
import type { components } from '@devpulse-dev/api-types';
export type Schemas = components['schemas'];
```

```ts
// entities/user/model/types.ts
import type { Schemas } from '@/shared/api/schema';

export type AuthorActivity = Schemas['AuthorSummary'];
export type ActivityScore = Schemas['ActivityScore'];

// entities/team/model/types.ts
export type Team = Schemas['Team'];
```

Domain-наименование сохраняем (`AuthorActivity` локально привычнее), но shape — точно как в OAS. Бамп версии пакета → `npm run typecheck` находит места которые надо адаптировать.

### Бамп версии контрактов

1. В `devpulse-oas` слит PR, опубликована новая версия `@devpulse-dev/api-types`.
2. `npm install @devpulse-dev/api-types@latest` (или подними `^1.x` в package.json).
3. `npm run typecheck` — TS подсветит места, где shape поехал.
4. Поправить → закоммитить `package.json` + `package-lock.json` + app-код.

`extractCardId` (`entities/commit/lib/task-id.ts`) остаётся ручным даже после перехода на типы — это defense-in-depth fallback на нестандартный формат сообщения коммита, не дубликат `taskNumber`.

---

## CI

GitHub Actions — [`.github/workflows/ci.yml`](.github/workflows/ci.yml). На каждый push в `main`/`master` и каждый PR:

| Шаг | Команда |
|---|---|
| Install | `npm ci` (с npm-кэшем GitHub Actions) |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` (zero warnings) |
| Test | `npm test` (vitest run) |
| Build | `npm run build` |
| Upload artifact | `dist/` на 7 дней (только для push в main/master) |

Concurrency-группа отменяет старый прогон при пуше нового коммита в ту же ветку. Общий timeout — 10 минут.

`npm ci` использует `${{ secrets.OAS_READ_TOKEN || secrets.GITHUB_TOKEN }}` для доступа к `@devpulse-dev/api-types` (дефолтный `GITHUB_TOKEN` не видит пакеты другого репо — нужен classic PAT с `read:packages`, заведённый секретом `OAS_READ_TOKEN`).

### Деплой

Пока не настроено. Когда определимся с хостингом, артефакт `devpulse-dist` из CI можно подцепить:
- статика на nginx / GitLab Pages / S3-bucket с CORS/proxy на бэк
- Reverse proxy: `/api/v2/*` → бэк, всё остальное — на статику с fallback на `index.html` (для React Router)

---

## Roadmap

Полный план и прогресс — в [`FEATURES.md`](./FEATURES.md). Закрыто:

- **Клиентские (9):** PoP-дельты, экспорт CSV/PNG, URL-фильтры, спарклайны, сравнение, аномалии, bus factor, lazy chunks, кэш навигаций.
- **Бэк-зависимые (закрытые):** B1 Hourly heatmap, B2 ревью-метрики, **Performance Review** (досье + `/teams` first-class + лиды).

Осталось — фичи, требующие бэка:

- **B3** Email / Slack дайджест
- **B4** Цели / таргеты команды
- **B5** Push-алерты аномалий

Мелочь без бэка: дефолтный период через Settings (сейчас 30 дней в persist-сторе, переопределяется URL).
