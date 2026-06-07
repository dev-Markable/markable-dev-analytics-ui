# DevPulse-UI · Refactoring Roadmap

Дорожная карта рефакторингов из senior-review. Идём сверху вниз — каждый
пункт закрывается отдельным стейджем с коммит-сообщением.

Легенда: ✅ закрыто · 🔜 в работе · ⬜ запланировано

---

## Quick wins (короткие, высокая ценность)

| # | Что | Стейдж | Статус |
|---|---|---|---|
| 1 | Удалить dead deps (`framer-motion`, `@ant-design/icons`) | 57 | ✅ |
| 2 | `ErrorBoundary` в `AppLayout` | 58 | ✅ |
| 3 | `axios-retry` для idempotent GET | 59 | ✅ |
| 4 | Тип-комментарий о расхождении `AuthorSummary` / `AuthorActivity` со схемой | 60 | ✅ |
| 5 | Confirm-модалка для «Сделать лидом» (защита от случайного клика) | 61 | ✅ |

## Среднесрочные (1-2 дня каждый)

| # | Что | Стейдж | Статус |
|---|---|---|---|
| 6 | Вынести `useScopedAuthors` — закрывает дубль фильтра на 4 страницах | 62 | ✅ |
| 7 | Разрезать `global.css` на per-widget CSS-файлы (или подключить CSS Modules для новых виджетов) | 63, 65 | ✅ |
| 8 | `@testing-library/react` + smoke-тесты топ-страниц (Dashboard / Profile / Activity / Performance Review / Teams) | 64, 66 | ✅ |
| 9 | `FilterUrlSync` — один направленный поток, убрать `eslint-disable` | 67 | ✅ |
| 10 | `AbortController` в `apiClient` (отмена устаревших запросов) | 68 | ✅ |
> #7 — закрыт полностью. `global.css` разрезан на 12 доменных файлов:
> `base.css` 28 · `shared-ui.css` 338 · `app-layout.css` 208 · `dashboard.css` 434 ·
> `weekly.css` 61 · `activity.css` 289 · `profile.css` 399 · `compare.css` 80 ·
> `perf-review.css` 883 · `teams.css` 214 · `collection.css` 90 · `settings.css` 142.
> Сам `global.css` удалён, порядок импорта явный в `main.tsx`.

> #8 — закрыт. Инфра: RTL + jsdom + jest-dom matchers + `renderWithProviders` helper
> (MemoryRouter + AntApp + ConfigProvider) + matchMedia/ResizeObserver-полифилы в setup.
> Покрытие: shared (EmptyState, ErrorBoundary, TeamScopePicker) + 5 page-level smoke
> (Dashboard, Profile, Activity, Performance Review, Teams). Тесты мокают
> `@/shared/api/client` глобально и заполняют сторы напрямую через `setState`.


## Долгосрочные (через 3-6 месяцев, по триггеру роста кодбазы)

| # | Что | Стейдж | Статус |
|---|---|---|---|
| 11 | Миграция на TanStack Query (порог 5+ эндпоинт-сторов пройден) | 69 | ✅ |
| 12 | Подгруппировка `widgets/` по доменам (`perf/`, `dashboard/`, `activity/`) | 70 | ✅ |
| 13 | CSS Modules для всех виджетов (если CSS вырос ещё на 50%) | 71 | ✅ (per-widget co-location) |
| 14 | Виртуализация `TasksTimeline` (`@tanstack/react-virtual`) | 72 | ✅ |

---

## Trade-offs по большим пунктам

### #11 TanStack Query
- **Стоимость:** 1-2 недели. 9 сторов → переписать сторы в `queryClient.useQuery`/`useMutation`.
- **Выгода:** dedupe, retry, stale-while-revalidate, devtools, минус ~300 строк store-инфры.
- **Trigger:** когда добавится 1-2 новых эндпоинт-стора, или backend пойдёт в WebSocket.

### #13 CSS — выбранный подход: «per-widget co-location» (не настоящие Modules)
- **Что сделано:** 36 CSS-файлов рядом с виджетами/компонентами (`styles.css` в их папках),
  3 глобальных — `base.css`, `app-layout.css`, `shared.css`. Domain-файлы из Stage 65 удалены.
- **Что не сделано:** настоящие CSS Modules с локальными именами (`.row` вместо
  `.leaderboard-row`) — это потребует переписать TSX-файлы на `className={s.row}`,
  ~3-5 дней работы + риск регрессий. Текущий подход даёт 80% выгоды (co-location,
  изменения локальны) за разумную цену.
- **Trigger перехода на настоящие Modules:** когда классы начнут конфликтовать
  визуально или поиск `.foo` будет давать одну и ту же ссылку из разных виджетов.

### #14 Виртуализация
- **Стоимость:** 1-2 дня.
- **Выгода:** TasksTimeline не лагает на 1000+ карточек.
- **Trigger:** когда у клиента будет проект с такой плотностью карточек.

---

# Roadmap v2 — senior re-review (2026-06)

Второй проход по зрелой кодбазе (после TanStack-миграции и CSS co-location).
Блокеров нет, typecheck чист, 230 тестов. Это дочистка хвостов миграции +
один пользовательский баг. Нумерация пунктов и стейджей продолжается.

## Quick wins (короткие, высокая ценность)

| # | Что | Стейдж | Статус |
|---|---|---|---|
| 15 | **Баг:** stale persisted date-range — `presetKey` не пересобирает `range` при рехидратации | 73 | ✅ |
| 16 | Удалить мёртвые константы (`STORE_CACHE_TTL_MS` и 5 др.) + стейл-комментарии (`createStatsStore`) | 74 | ✅ |
| 17 | `WeeklyTable`: переименовать `teamEnabled`, убрать обёртку-хук `useExpandedRowsReset` | 75 | ✅ |

## Среднесрочные (1-2 дня каждый)

| # | Что | Стейдж | Статус |
|---|---|---|---|
| 18 | Завершить миграцию: `collection.store` → `useMutation`/`useQuery`, удалить хелперы `async-state` + `race.ts` | 76 | ✅ |
| 19 | Унифицировать async-UI-контракт + извлечь `SectionCard`/`AsyncContent` (убить дубль card-shell в 5 виджетах) | 77 | ✅ |

## Долгосрочные (по триггеру)

| # | Что | Стейдж | Статус |
|---|---|---|---|
| 20 | Accessibility-проход (`aria-label` на иконочных кнопках, heatmap для скринридеров) | 78 | ⬜ |
| 21 | Локальные `ErrorBoundary` вокруг recharts-виджетов | 79 | ⬜ |

### Trade-offs

**#15 (баг)** — пользователь, выбравший пресет «последние N дней», при заходе на следующий
день без query в URL видит вчерашнее окно. Фикс: `merge`/`onRehydrateStorage` пересобирает
`range` из `presetKey` при наличии пресета.

**#18** — пока `collection.store` жив на старой парадигме, нельзя удалить `async-state.ts`/`race.ts`,
и новый разработчик копирует старый паттерн как образец. После закрытия удаляется ~120 строк инфры.

**#19** — сейчас три контракта async-UI (`AsyncState`-объект / `DataTable` плоские пропсы /
`LeaderboardCard` status+items) + ручная сборка `status` в `DashboardPage`. `DataTable` извлечён,
но используется в 1 месте — нужен `SectionCard` (card-shell с header/actions) + `AsyncContent`
(loading/error/empty), а не голая таблица. Закрывает дубль ~30 строк × 5 виджетов.

> #19 — закрыт частично-по-ядру. Извлечены `shared/ui/SectionCard` (оболочка карточки:
> иконка/заголовок/описание/actions + body) и `shared/ui/AsyncContent` (единый precedence
> loading→error→empty→content со слотами под разные скелетоны; `hasData` отделён от `isEmpty`
> для post-filter случаев — ReviewsCard). На них переведены 5 async-виджетов с триадой:
> LeaderboardCard, AuthorsTable, WeeklyTable, ReviewsCard, ProfileReviews. Внешние props
> виджетов не менялись — страницы не тронуты.
>
> **Осталось (опционально, инкрементально):** ~25 статичных карточек (perf/*, activity-charts,
> team/*, compare/*, settings/*, collection/*) тоже рендерят `leaderboard-card__header` руками,
> но без async-триады и часто с кастомными шапками (легенды, контролы). Переводить их на
> `SectionCard` стоит по одной при следующем касании, а не пачкой — иначе риск визуальных
> регрессий без QA. `DataTable` (1 потребитель) оставлен как есть — он про таблицу, а не оболочку.

---

# Roadmap v3 — senior re-review #2 (2026-06)

Третий проход после закрытия Roadmap v2 + апгрейда collection-слоя (реальный
polling `/latest`, кооперативная отмена, companion-эндпоинт). Здоровье:
typecheck/lint чисты, 212 тестов / 39 файлов. Блокеров нет — это полировка
нового кода + добор хвоста по #19.

## Pre-merge (закрыть до влития нового collection-кода)

| # | Что | Стейдж | Статус |
|---|---|---|---|
| 22 | **Тест:** `AsyncContent` — прямое покрытие precedence-матрицы (loading/error/empty/hasData) | 80 | ✅ |
| 23 | `CurrentRunCard`: кнопка «Обновить статус» мигает на каждом poll-тике (`refreshing={isFetching}`) | 81 | ⬜ |

## Бэклог (не блокеры)

| # | Что | Стейдж | Статус |
|---|---|---|---|
| 24 | Гонка записи в `LATEST_RUN_KEY`: stale-poll перетирает `trigger.onSuccess` (invalidate/cancelQueries) | — | ⬜ |
| 25 | Добить #19: `LeaderboardCard` → `AsyncState`, убрать ручную сборку `status` в `DashboardPage` | — | ⬜ |
| 26 | Тесты `use-collection` (refetchInterval-поллинг: RUNNING / triggering) | — | ⬜ |
| 27 | `AsyncContent` API: заменить скрытый переключатель `error !== undefined` на явный проп | — | ⬜ |

### Trade-offs

**#22** — `AsyncContent` введён в стейдже 77 с нетривиальным ветвлением (`hasData` ≠ `isEmpty`
для post-filter; `error !== undefined` как ErrorState↔empty), но покрыт лишь косвенно через
page-smoke. Самое место для регрессий — нужен прямой unit-тест матрицы. ~1 час.

**#23** — `isFetching` истинно при любом запросе, включая фоновый `refetchInterval` (3 c).
Пока прогон `RUNNING`, кнопка ручного обновления спиннерит сама по себе. Различить ручной
refetch и фоновый poll. Дёшево.

**#24** — синхронный POST пишет финальный run в `onSuccess`, а параллельный in-flight poll
может зарезолвиться позже со stale `RUNNING` и перетереть. Самоисцеляется за ≤3 c, но даёт
флибер статуса. Низкий приоритет.

**#25** — `AsyncContent` унифицировал рендеринг, но контракт-spread на границе пропсов остался
(`LeaderboardCard` status+items vs остальные `AsyncState`; ручной `status` в `DashboardPage`).
