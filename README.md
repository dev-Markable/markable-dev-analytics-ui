# DevPulse — фронт

[![CI](https://github.com/devpulse-dev/devpulse-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/devpulse-dev/devpulse-ui/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-274_passed-2ea44f?logo=vitest&logoColor=white)](#тесты)
[![OAS](https://img.shields.io/badge/contract-%5E2.0.0-2ea44f?logo=openapiinitiative&logoColor=white)](#api-типы-devpulse-devapi-types)

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-5-0170fe?logo=antdesign&logoColor=white)](https://ant.design/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-ff4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5-443e38)](https://zustand-demo.pmnd.rs/)
[![Axios](https://img.shields.io/badge/Axios-1.7-5a29e4?logo=axios&logoColor=white)](https://axios-http.com/)
[![React Router](https://img.shields.io/badge/React_Router-6-ca4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev/)

Аналитика активности разработчиков: дашборд с activity-score, недельная динамика,
профили, heatmap-календарь, сравнение, bus factor, ревью-метрики, **Performance
Review** (досье к 1:1), **управление командами и лидами**, экспорт.
Плюс: **командная палитра** (Cmd/Ctrl-K), лента **«Требует внимания»** (сигналы
рисков), **распределения метрик** (медианы/перцентили), **концентрация ревью**
(review bus factor) и **drill-down** по графикам активности.
Бэк — [`DevPulse-core`](../DevPulse-core), API v2 (REST + RFC 7807 problem+json),
контракт `@devpulse-dev/api-types ^2.0.0`.

> Идея новой страницы **Flow / Delivery** (поток задач: throughput, cycle-time,
> WIP, дефекты) и требования к бэку — в [`FLOW-DELIVERY.md`](./FLOW-DELIVERY.md).

> Дорожная карта фич и прогресс — в [`FEATURES.md`](./FEATURES.md).
> История рефакторингов из senior-review — в [`REFACTORING.md`](./REFACTORING.md).

---

## Стек

| Слой | Технология |
|---|---|
| UI | React 19 + TypeScript (strict) |
| Сборка | Vite 5 |
| Компоненты | Ant Design 5 (`cssVar: true`, `hashed: false`) |
| Данные | **TanStack Query 5** (запросы/кэш/dedupe) + **Zustand 5** для UI-state |
| HTTP | Axios + `axios-retry` (3 попытки на 5xx/network для GET) + interceptor → RFC 7807 → `ApiError` |
| Роутинг | React Router 6 (с v7 future flags) |
| Графики | Recharts (темо-адаптивные через CSS variables) |
| Виртуализация | `@tanstack/react-virtual` (TasksTimeline на длинных списках) |
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
├── app/        # провайдеры (QueryProvider, AntdProvider, ErrorBoundary, FilterUrlSync),
│               #         router, глобальные стили (base, app-layout, shared)
├── pages/      # роуты (Dashboard, Weekly, Activity, Compare, Performance Review,
│               #         Teams, Profile, Collection, Settings, NotFound)
├── widgets/    # самостоятельные UI-блоки, сгруппированные по доменам:
│               #   activity/ (summary, heatmap, hourly, repos, contributors,
│               #     bus-factor, reviews, distribution, review-concentration,
│               #     drilldown), dashboard/ (summary, leaderboard, authors-table,
│               #     signals), collection/, compare/, perf/, profile/,
│               #     settings/, team/, weekly/  + app-layout (shell)
│               #   у каждого виджета свой styles.css co-located
├── features/   # пользовательские сценарии (theme-switch, date-range-filter,
│               #         team-scope, sidebar, command-palette)
├── entities/   # бизнес-сущности (user, team, commit, kaiten-card, stats,
│               #         dashboard, performance-review, collection-run)
└── shared/     # api/, config/, lib/, hooks/, ui/, test/factories.ts + render-helper
```

**Правило слоёв:** import только сверху вниз (`pages → widgets → features → entities → shared`). Барелл `@/app/router` грузит весь router-граф, поэтому константы (`ROUTES`, `buildProfilePath`) импортируются из `@/app/router/paths` напрямую — это избегает циклической зависимости через `widgets/app-layout`.

**Внутри slice'а:** `ui/` (компоненты), `model/` (типы), `api/` (axios-обёртки + queryOptions), `lib/` (чистые утилиты), `config/` (константы, columns), `index.ts` (public API), `styles.css` (per-widget CSS).

### Состояние

**Данные с бэка — TanStack Query.** Каждая entity-сущность экспортирует `queryOptions`-фабрики из `api/queries.ts`. Страницы используют `useQuery(dashboardQuery({from,to}))` напрямую.

- **`staleTime: 60s`** — повторный mount страницы за тот же ключ не идёт в сеть.
- **Request dedupe** — три виджета на одной странице с тем же ключом → один запрос.
- **AbortController** встроен в `queryFn({ signal })` — при смене ключа старые запросы отменяются.
- **Cross-page cache** — пришёл на Profile после Activity за тот же период → ревью-данные мгновенно из кэша.
- **Мутации** через `useMutation` + `qc.invalidateQueries({ queryKey: teamsQueryKey })` — TanStack сам перетянет свежий список.

**UI-state — Zustand с `persist` middleware.** Только то, что должно пережить перезагрузку:
- `theme` (`devpulse.theme`) — light/dark
- `dateRange` (`devpulse.date-range`) — выбранный период
- `teamScope` (`devpulse.team-scope`) — глобальный фильтр команды
- `sidebar` (`devpulse.sidebar`) — свёрнут/развёрнут

- **Фильтры в URL.** `FilterUrlSync` (`app/providers`) двусторонне синхронит `dateRange` и `teamScope` с `?from&to&team=<name>` — диплинки, закладки, кнопка «назад». Скоп `ALL_TEAMS` (по умолчанию) в URL не пишется.
- **Lazy-страницы.** Все роуты кроме стартового Dashboard — `React.lazy` + `Suspense`; recharts вынесен из инициального бандла.

### Поток данных

```
useQuery(...)        ← @tanstack/react-query
        │
        ▼ (data, isPending, error, …)
filterByScope(items, scope, getTeam)   ← features/team-scope (pure, тестируемо)
        │
        ▼ (отфильтрованный массив)
Aggregation libs (aggregateByContributor, groupCommitsByTask, …)
        │
        ▼
Widget принимает чистые данные
```

**Принцип:** глобальный team-scope применяется на page-уровне ДО передачи данных в виджеты. Все производные (totals, top-N, pagination) корректны без дополнительных запросов.

---

## Страницы

| Route | Файл | API |
|---|---|---|
| `/` Дашборд | `pages/dashboard/` | `GET /dashboard?size=500` (×2 — текущий + предыдущий период для PoP-дельт) + `GET /stats/reviews` (лента сигналов) |
| `/weekly` Недели | `pages/weekly/` | `GET /stats/weekly` |
| `/activity` Активность | `pages/activity/` | `GET /stats/daily` + `GET /stats/hourly` + `GET /stats/reviews` + `GET /dashboard` + `GET /users` |
| `/compare` Сравнение | `pages/compare/` | — (использует `dashboardQuery`, выбор в `?ids=`) |
| `/performance-review` Performance Review | `pages/performance-review/` | `GET /performance/review?email&from&to&compareToPrevious` + `GET /users` |
| `/teams` Команды | `pages/teams/` | `GET /teams`, `PUT /teams/lead`, `PUT /users/{email}/team` |
| `/users/:email` Профиль | `pages/profile/` | `GET /users/{email}/profile` + `GET /stats/reviews` |
| `/collection` Сбор | `pages/collection/` | `POST /collection/runs`, `GET /collection/runs/{id}`, `POST /kaiten/sync-users` |
| `/settings` Настройки | `pages/settings/` | — (только localStorage) |
| `*` 404 | `pages/not-found/` | — |

---

## Команды и лиды

С API 1.7.0 команды — first-class сущность.

- **`UserProfile.team`** (string|null) и **`UserProfile.isLead`** (boolean) есть и в `AuthorSummary` (`/dashboard`, `/stats/summary`, `/stats/weekly`), и в `ReviewAuthor` (`/stats/reviews`) — кросс-резолв не нужен.
- **`GET /teams`** отдаёт `Team { name, lead: UserProfile|null, members: UserProfile[] }`. Источник имён для глобального пикера и экрана управления.
- **`PUT /teams/lead`** body `{ team, email|null }` — назначить / снять лида (бэк держит инвариант «один лид»).
- **`PUT /users/{email}/team`** body `{ team: string|null }` — добавить / перевести / исключить. Имя — свободный текст; новая команда появляется при первом назначении.

### Глобальный фильтр (топбар)

`features/team-scope` — единый источник правды:
- значения: `ALL_TEAMS` (по умолчанию, в URL не пишется), `NO_TEAM` («без команды»), либо имя команды;
- `filterByScope(items, scope, getTeam, alwaysKeep?)` — pure-функция фильтрации (тестируется без React);
- `useTeamScopeFilter(items, getTeam, alwaysKeep?)` — мемоизированная обёртка-хук;
- если в persisted-store сохранена пропавшая команда (переименована/удалена), `TeamScopePicker` мягко сбрасывается в `ALL_TEAMS` + info-тост.

Серверного `?team=` на `/dashboard` и `/stats/*` нет — фильтрация чисто клиентская. `GET /users?team=` используется только для picker'а в Performance Review.

### Лид-бейдж

`<UserAvatar isLead>` рисует золотую корону-overlay поверх аватара. Размер бейджа адаптивен (`leadBadgeSize`). Дополнительно `<TeamChip team>` — компактный тэг команды для строк / карточек.

---

## Тема и стилизация

- **AntD ConfigProvider** с `cssVar: true` + `hashed: false` → AntD генерирует CSS-переменные `--ant-color-*`, `--ant-box-shadow` на `:root`. Кастомный CSS читает их без хешей.
- **Light/dark** через `data-theme` атрибут на `<html>`. `:root[data-theme='dark'] .smth` — точечные оверрайды для shadow/borders.
- **CSS co-location.** Каждый виджет/компонент имеет свой `styles.css` рядом и подключает его через `import './styles.css'` в `index.ts`. Vite склеивает всё в один бандл. Глобальных файлов — три: `base.css` (vars/html/body), `app-layout.css` (каркас приложения), `shared.css` (кросс-виджетные классы вроде `.leaderboard-card`, `.activity-badge`).
- **Палитра:** Linear/Stripe-стиль. Page — серый/тёмный, sidebar и cards — белые/elevated. Topbar полупрозрачный с `backdrop-filter: blur` через `color-mix`.
- **Шрифты:** Inter (UI) + JetBrains Mono (хеши коммитов, теги задач) — Google Fonts.
- **Print-CSS** для `/performance-review` — скрывает sidebar/topbar/контролы, убирает тени, держит блоки `break-inside: avoid` для аккуратного PDF.

---

## Надёжность

- **`ErrorBoundary`** в `AppLayout` (`shared/ui/ErrorBoundary`): runtime-ошибка в виджете не уносит каркас. AntD `Result` с двумя действиями: «Повторить» (reset state) и «Перезагрузить страницу». `resetKey={pathname}` — переход на другой маршрут автоматически сбрасывает фолбэк. Точка подключения Sentry — `componentDidCatch`.
- **`axios-retry`** для GET: 3 попытки на 5xx, 429, network-errors с экспоненциальным backoff (300 → 900 → 2100 мс). POST/PUT/DELETE не ретраим — могут породить дубль. 4xx (404, 400) тоже не ретраим — устойчивые клиентские ошибки.
- **`AbortController`** — TanStack Query прокидывает `signal` в `queryFn({ signal })`, axios понимает signal из коробки. Старый запрос отменяется при смене ключа или unmount страницы.

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

Раздел `/performance-review` — досье к 1:1. Picker разработчика подхватывает глобальный team-scope из топбара (одна точка правды). Метрики (`PerformanceMetrics`) — 14 полей `MetricDelta { current, previous?, delta?, deltaPct? }`. У снапшот-метрик (`defectsInWork`, `devTasksInWork`) `previous/delta/deltaPct = null` — дельту не рисуем. У `avgTimeToMergeHours` инвертирован тон (меньше = лучше). При отсутствии PoP-сравнения foot плитки молчит (не пишем «без изменений» — невозможно отличить от настоящего равенства).

С API 2.0.0 «заметные результаты» — два типизированных среза:
- **`notable.firefighting`** — закрытые critical/high дефекты;
- **`notable.deliveredFeatures`** — корневые задачи с done-юскейсами.

С API 1.9.0 cycle-time раздельный: `cycleTime: { defects, development }` — длительность у них принципиально разная.

Честные подписи в UI: «дефекты/задачи — по текущему состоянию карточек», «тесты — строки тест-кода, не число тестов».

### Activity score (дашборд)

`/dashboard` возвращает у каждого автора композитный `activity: ActivityScore | null`:

- `score = volumeFactor × qualityFactor` — финал, `1.0 ≈ норма команды`
- `category` — `INACTIVE` / `BELOW_AVERAGE` / `ACTIVE` / `STAR`
- `volumeFactor` — `nonMergeCommits / expected` (baseline 50 коммитов / 30 дней)
- `qualityFactor` — 0.3..1.0 от avg lines/commit (штраф за микро-коммиты и бомбы)

Сортировка дашборда — по `activity.score desc`. На weekly/summary эндпоинтах `activity = null`, на daily поля нет.

Фронт показывает `<ActivityBadge>` (`entities/user/ui/ActivityBadge.tsx`) — Tag с цветом по категории + tooltip с разбивкой компонент. Используется в `LeaderboardRow` (компактно, inline с именем) и в столбце AuthorsTable.

### TasksTimeline и виртуализация

`widgets/profile/tasks-timeline` рендерит «коммиты по задачам» на профиле. На больших проектах в раскрытой строке (`TaskCommitsBreakdown`) могут быть сотни коммитов:

- **При < 50** — рендерим все строки как обычно.
- **При ≥ 50** — `useVirtualizer` из `@tanstack/react-virtual`, скролл-контейнер 480px, overscan: 8. В DOM только видимые строки.

Главный список задач остаётся на `<DataTable>` с `pagination=25` — это уже эффективно. Фильтрация по поиску — через `useDeferredValue(debounced)`: React 19 делает её неблокирующей, инпут остаётся отзывчивым.

### Командная палитра (Cmd/Ctrl-K)

`features/command-palette` — глобальный поиск-навигация (Linear-style). Хоткей вешается на `window` в capture-фазе, монтируется один раз в `AppLayout`, кнопка-триггер — в топбаре. Ищет по 4 группам: страницы, пресеты периода, команды, разработчики (с аватарами). Действие применяется сразу через существующие сторы (`navigate` / `setPreset` / `setScope`). Справочники `users`/`teams` грузятся лениво (`enabled: open`). Чистый токен-матчинг — в `lib/match.ts`. Страницы описаны локально через `ROUTES` (features не импортят widgets — правило слоёв).

### Лента «Требует внимания» (signals inbox)

`widgets/dashboard/signals` — риски, собранные на клиенте из уже загруженных данных дашборда (текущий + предыдущий период) и ревью. Чистая `buildSignals` даёт 4 типа сигналов: резкое падение activity-score (PoP), низкая активность второй период подряд (хроники, у которых нет спада), MR без ревью, концентрация ревью на одном человеке. Сортировка по серьёзности, деталь — диплинк в профиль. Глубже двух периодов нужна история снапшотов на бэке.

### Распределения и концентрация ревью

`widgets/activity/distribution` — гистограмма метрики (Recharts) с маркерами медианы/p75/p90 + полоса перцентилей; медиана/перцентили вместо одного среднего. `widgets/activity/review-concentration` — review bus factor (сколько ревьюеров покрывают >50% approve) + Gini + кривая Лоренца. Обе — pure-lib со статистикой (квантили R-7, Тьюки-усы, Джини), покрыты юнит-тестами. Per-person ревью-цифры остаются в таблице «Ревью» — дубля нет.

### Drill-down по графикам активности

`widgets/activity/drilldown` — переиспользуемый Drawer + чистый `aggregateDailyDrill`. Графики не знают про Drawer: по клику собирают `DrillContent` и поднимают через `onDrill`, страница держит состояние и рендерит один Drawer. Подключены: Топ репозиториев (→ авторы репо), Календарь-heatmap (→ авторы дня), Гистограмма (→ разработчики бакета). Почасовой heatmap drill-down не имеет — бэк отдаёт агрегат `(weekday, hour)` без авторов.

---

## Скрипты

```bash
npm run dev         # vite dev server :9000
npm run build       # tsc -b && vite build → dist/
npm run preview     # превью production-сборки
npm run typecheck   # tsc -b --noEmit
npm run lint        # eslint (нулевая толерантность к warning'ам)
npm test            # vitest run (unit + UI-тесты)
npm run test:watch  # vitest в watch-режиме
npm run test:cov    # vitest с coverage-отчётом
```

---

## Тесты

Vitest (нативно с Vite). Покрыты **чистые функции** (где цена бага высока, а DOM не нужен) **и UI-smoke** для топ-страниц (рендер не падает). Тест-файлы `*.test.ts` / `*.test.tsx` co-located рядом с кодом.

Vitest умеет per-file environment: `*.test.tsx` → `jsdom`, `*.test.ts` → `node` (быстрее для чистых функций).

Фабрики тестовых данных — `src/shared/test/factories.ts` (`makeAuthor`, `makeCommit`, `makeCard`, `makeDaily`, `makeWeek`, `makeActivity`). `renderWithProviders` (`src/shared/test/render.tsx`) — обёртка для UI-тестов: `QueryClientProvider` + `MemoryRouter` + `AntApp` + `ConfigProvider`, с `setupQueryCache?(qc)` для предзаполнения кэша вместо запросов.

**Сейчас 274 теста в 45 файлах** (`npm test`).

Ключевые модули с покрытием:

| Модуль | Что проверяется |
|---|---|
| `shared/api/race` | `createRaceGuard`: счётчик, защита от устаревших ответов |
| `shared/api/async-state` | `idle/loading/success/failure`, сохранение stale-data, `isFresh` (под `vi.useFakeTimers`) |
| `shared/api/abort` | `isAbortError`: распознаёт axios Cancel / CanceledError / DOM AbortError / `ERR_CANCELED` |
| `entities/commit/lib/task-id` | `extractCardId`, `stripTaskPrefix` |
| `entities/dashboard/lib/*` | `selectDashboardSections`, `aggregateAuthors` |
| `entities/user/lib/initials` | `userInitials` / `userDisplayName` / `authorAsUser` |
| `entities/stats/lib/apply-team-filter` | пересчёт недельных totals под фильтр команды |
| `features/team-scope` | `matchesScope` (ALL/NO_TEAM/конкретная) + `filterByScope` с `alwaysKeep` |
| `widgets/activity/contributors/lib/*` | `aggregateByContributor` (с team/isLead enrichment), `detect-anomalies` |
| `widgets/activity/summary/lib`, `bus-factor`, `hourly` | агрегации |
| `widgets/activity/distribution/lib` | `quantile` (R-7), `computeDistribution` (квартили, Тьюки-усы, выбросы), `histogram` |
| `widgets/activity/review-concentration/lib` | `giniCoefficient`, `topShare`, `reviewBusFactor`, `lorenzCurve` |
| `widgets/activity/drilldown/lib` | `aggregateDailyDrill` (срез daily по авторам) |
| `widgets/dashboard/signals/lib` | `buildSignals` (падение PoP, хроники, MR без ревью, концентрация) |
| `features/command-palette/lib` | `matchCommands` (токен-поиск, AND, регистронезависимо) |
| `widgets/perf/*` | `engagement`, `givenShare`, `testRatio`, `formatDays`, `deliveryProgress` |
| `widgets/perf/controls/config/periods` | `presetRange` / `detectPeriodKey` |
| `widgets/profile/tasks-timeline/lib/group-commits` | матчинг коммит↔карточка, orphan-группа |
| `app/providers/FilterUrlSync` | URL ↔ store sync, ALL_TEAMS не пишется, фикс persisted-scope |
| `shared/ui/{EmptyState,ErrorBoundary}` | smoke + reset через `resetKey` |
| `features/team-scope/ui/TeamScopePicker` | дефолт, выбор, fallback на пропавшую команду |
| `pages/*` (5 страниц) | page-level smoke с предзаполненным cache: рендерится без exceptions |
| `shared/lib/{number,date,export,string}` | форматтеры, ranges, csv, truncate |

> **tsconfig:** `tsconfig.app.json` исключает тесты (в прод-build не идут),
> `tsconfig.test.json` проверяет их отдельно с послаблением `noUncheckedIndexedAccess`
> + types `jest-dom`. `tsc -b` гоняет оба проекта.

---

## API-типы (`@devpulse-dev/api-types`)

Типы запросов/ответов **не генерируются у нас** — фронт ставит готовый npm-пакет
[`@devpulse-dev/api-types`](https://github.com/devpulse-dev/devpulse-oas/pkgs/npm/api-types) из GitHub Packages. Внутри — bundled `.d.ts` на весь `/api/v2` (единый `components` / `paths` / `operations`), собранный из OpenAPI-контрактов в `devpulse-oas`. Single source of truth — бэк implement'ит те же спеки, фронт импортит те же типы. Версия пакета в lockstep с Maven-контрактами.

**Текущая версия:** `^2.0.0` — `NotableResults` (firefighting + deliveredFeatures) вместо плоского `highlights[]`. Также подтянуты `CycleTimeBreakdown` (defects/development) из 1.9.0, `KaitenInsights` (defects/development/cycleTime/balance) из 1.8.0, `team`/`isLead` во всех developer-эндпоинтах из 1.7.0.

> ⚠️ Локальные имена `AuthorSummary`/`AuthorActivity` НЕ совпадают с одноимёнными схемами OAS — см. шапку `src/entities/user/model/types.ts`.

### Доступ к GitHub Packages

`.npmrc` (коммитится, секрета внутри нет — токен берётся из env):

```ini
@devpulse-dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

GitHub Packages npm-registry требует токен **даже для публичного пакета**. Перед `npm install`:

```bash
export GITHUB_TOKEN=ghp_xxx   # PAT с read:packages
npm install
```

> Не добавляй глобальный `registry=` в `.npmrc` — иначе react/axios/… полезут в GitHub Packages и получат 404. Только scoped-строка.

### Как использовать

Все entity-типы — **алиасы на схемы из пакета**. Барелл `src/shared/api/schema.ts`:

```ts
import type { components } from '@devpulse-dev/api-types';
export type Schemas = components['schemas'];
```

```ts
export type AuthorActivity = Schemas['AuthorSummary'];
export type Team = Schemas['Team'];
```

Каждая entity также экспортирует `queryOptions`-фабрики из `api/queries.ts` — единственное место, где `useQuery(...)` берёт ключ + fetcher.

### Бамп версии контрактов

1. В `devpulse-oas` слит PR, опубликована новая версия `@devpulse-dev/api-types`.
2. `npm install @devpulse-dev/api-types@latest`.
3. `npm run typecheck` — TS подсветит места, где shape поехал.
4. Поправить → закоммитить.

`extractCardId` (`entities/commit/lib/task-id.ts`) остаётся ручным даже после перехода на типы — defense-in-depth fallback на нестандартный формат сообщения коммита.

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

Полный план и прогресс — в [`FEATURES.md`](./FEATURES.md). Рефакторинги из senior-review — в [`REFACTORING.md`](./REFACTORING.md), все 14 пунктов закрыты.

**Продуктовый план — закрыто:**
- **Клиентские (14):** PoP-дельты, экспорт CSV/PNG, URL-фильтры, спарклайны, сравнение, аномалии, bus factor, lazy chunks, кэш навигаций, **командная палитра (Cmd/Ctrl-K)**, **лента сигналов «Требует внимания»**, **распределения метрик**, **концентрация ревью (review bus factor)**, **drill-down по графикам**.
- **Бэк-зависимые:** B1 Hourly heatmap, B2 ревью-метрики, **Performance Review** (досье + Kaiten-insights + notable), **команды/лиды first-class**, team/isLead во всех developer-эндпоинтах.

**Осталось — фичи, требующие бэка:**
- **A** Страница **Flow / Delivery** (throughput, cycle-time, WIP, aging, дефекты) — спека и контракт в [`FLOW-DELIVERY.md`](./FLOW-DELIVERY.md)
- **B3** Email / Slack дайджест
- **B4** Цели / таргеты команды
- **B5** Push-алерты аномалий (лента сигналов уже есть на клиенте — нужна история снапшотов + доставка)
- **C** Лонгитюд / тренды во времени (история снапшотов: тренд >2 периодов, forecast)
- **Cohort / Retention** — ретеншн-вью по всем разработчикам (история активности команды) — спека в [`COHORT-RETENTION.md`](./COHORT-RETENTION.md)

Мелочь без бэка: дефолтный период через Settings (сейчас 30 дней в persist-сторе, переопределяется URL).
