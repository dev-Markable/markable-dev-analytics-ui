# DevPulse — фронт

[![CI](https://github.com/devpulse-dev/devpulse-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/devpulse-dev/devpulse-ui/actions/workflows/ci.yml)

Аналитика активности разработчиков: коммиты, недельная динамика, профили, heatmap-календарь.
Бэк — [`DevPulse-core`](../DevPulse-core), API v2 (REST + RFC 7807 problem+json).

---

## Стек

| Слой | Технология |
|---|---|
| UI | React 19 + TypeScript (strict) |
| Сборка | Vite 5 |
| Компоненты | Ant Design 5 (`cssVar: true`) |
| Состояние | Zustand 5 (`persist` middleware) |
| Роутинг | React Router 6 (с v7 future flags) |
| HTTP | Axios + кастомный interceptor → RFC 7807 → `ApiError` |
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

# Только typecheck
npm run typecheck
```

**Требования:** Node 20+, npm 10+. Бэк должен быть запущен на `localhost:8080` (или поправь `VITE_API_PROXY_TARGET` в `vite.config.ts`).

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
├── pages/      # роуты (Dashboard, Weekly, Profile, Activity, Collection, Settings, NotFound)
├── widgets/    # самостоятельные UI-блоки (LeaderboardCard, ActivityHeatmap…)
├── features/   # пользовательские сценарии (theme-switch, date-range-filter, team-filter)
├── entities/   # бизнес-сущности (user, commit, kaiten-card, stats, dashboard, collection-run)
└── shared/     # api/, config/, lib/, hooks/, ui/ — переиспользуемое
```

**Правило слоёв:** import только сверху вниз (`pages → widgets → features → entities → shared`). Барелл `@/app/router` грузит весь router-граф, поэтому константы (`ROUTES`, `buildProfilePath`) импортируются из `@/app/router/paths` напрямую — это избегает циклической зависимости через `widgets/app-layout`.

**Внутри slice'а:** `ui/` (компоненты), `model/` (Zustand + типы), `api/` (axios-обёртки), `lib/` (чистые утилиты), `config/` (константы, columns), `index.ts` (public API).

### Состояние

- **Filter stores** (`features/*/model/*.store.ts`) — глобальные настройки UI (`theme`, `dateRange`, `teamFilter`, `teamMembers`). Все с `persist` middleware → ключи `devpulse.*` в localStorage.
- **Entity stores** (`entities/*/model/*.store.ts`) — кеш данных с бэка. Каждый держит `AsyncState<T>` (`status`, `data`, `error`, `lastFetchedAt`).
- **Race protection.** Любой store с `fetch()` использует `createRaceGuard()` — если юзер переключит фильтр пока летит запрос, старый ответ молча игнорируется.
- **Селекторы через `useShallow`** — не реренжем компонент, если объект-выборка не изменился по структуре.

### Поток данных

```
backend → entity store fetch → AsyncState<T>
                                 │
                                 ▼
                       Filter store (team)
                                 │
                                 ▼ (фильтрация ДО агрегации)
                  Aggregation libs (aggregateByContributor,
                  groupCommitsByTask, applyTeamFilterToWeekly…)
                                 │
                                 ▼
                       Widget принимает чистые данные
```

**Принцип:** team-filter применяется на page-уровне ДО передачи данных в виджеты. Так все производные (totals, top-N, pagination) корректны без дополнительных запросов.

---

## Страницы

| Route | Файл | API |
|---|---|---|
| `/` Дашборд | `pages/dashboard/` | `GET /dashboard?size=500` |
| `/weekly` Недели | `pages/weekly/` | `GET /stats/weekly` |
| `/activity` Активность | `pages/activity/` | `GET /stats/daily` + `GET /dashboard` (для аватаров) |
| `/users/:email` Профиль | `pages/profile/` | `GET /users/{email}/profile` |
| `/collection` Сбор | `pages/collection/` | `POST /collection/runs`, `GET /collection/runs/{id}`, `POST /kaiten/sync-users` |
| `/settings` Настройки | `pages/settings/` | — (только localStorage) |
| `*` 404 | `pages/not-found/` | — |

---

## Тема и стилизация

- **AntD ConfigProvider** с `cssVar: true` → AntD генерирует CSS-переменные `--ant-color-*`, `--ant-box-shadow` на `:root`. Кастомный CSS читает их без хешей.
- **Light/dark** через `data-theme` атрибут на `<html>`. `:root[data-theme='dark'] .smth` — точечные оверрайды для shadow/borders.
- **Палитра:** Linear/Stripe-стиль. Page — серый/тёмный, sidebar и cards — белые/elevated. Topbar полупрозрачный с `backdrop-filter: blur` через `color-mix`.
- **Шрифты:** Inter (UI) + JetBrains Mono (хеши коммитов, теги задач) — Google Fonts.

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

`/stats/daily` возвращает `email` без `displayName`/`avatarUrl` — это намеренно (тысячи записей за период, enrichment дорогой). Если нужны аватары — тяни параллельно `/dashboard` и мерж по email (см. `pages/activity/ui/ActivityPage.tsx`).

### Team filter — список редактируется

Список членов команды живёт в `useTeamMembersStore` (persist), стартует с `DEFAULT_TEAM_MEMBERS` (`features/team-filter/config/team-members.ts`). Управление — на странице Settings → «Команда и фильтрация».

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
```

---

## API-типы (`@devpulse-dev/api-types`)

Типы запросов/ответов **не генерируются у нас** — фронт ставит готовый npm-пакет
[`@devpulse-dev/api-types`](https://github.com/devpulse-dev/devpulse-oas/pkgs/npm/api-types) из GitHub Packages. Внутри — bundled `.d.ts` на весь `/api/v2` (единый `components` / `paths` / `operations`), собранный из OpenAPI-контрактов в `devpulse-oas`. Single source of truth — бэк implement'ит те же спеки, фронт импортит те же типы. Версия пакета в lockstep с Maven-контрактами (`1.x` ↔ контракты `1.x`).

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

Все entity-типы (`AuthorActivity`, `KaitenCard`, `Commit`, `DashboardData`, …) — **алиасы на схемы из пакета**. Барелл `src/shared/api/schema.ts`:

```ts
import type { components } from '@devpulse-dev/api-types';
export type Schemas = components['schemas'];
```

```ts
// entities/user/model/types.ts
import type { Schemas } from '@/shared/api/schema';

export type AuthorActivity = Schemas['AuthorSummary'];
export type ActivityScore = Schemas['ActivityScore'];
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
| Build | `npm run build` |
| Upload artifact | `dist/` на 7 дней (только для push в main/master) |

Concurrency-группа отменяет старый прогон при пуше нового коммита в ту же ветку. Общий timeout — 10 минут.

### Деплой

Пока не настроено. Когда определимся с хостингом, артефакт `devpulse-dist` из CI можно подцепить:
- статика на nginx / GitLab Pages / S3-bucket с CORS/proxy на бэк
- Reverse proxy: `/api/v2/*` → бэк, всё остальное — на статику с fallback на `index.html` (для React Router)

---

## Roadmap

- [ ] OpenAPI → автогенерация типов API (`openapi-typescript`)
- [ ] Lazy-route chunks (`React.lazy()` per page)
- [ ] Unit-тесты на критичные utils (extractCardId, group-commits, aggregate-authors)
- [ ] Кэширование между навигациями через `isFresh(state, ms)` чек в эффектах страниц
- [ ] Hourly heatmap на Profile (нужен бэк-эндпоинт или агрегация из `commits[]`)
- [ ] Default-период через Settings (сейчас захардкожено 30 дней)
