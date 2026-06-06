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
| 7 | Разрезать `global.css` на per-widget CSS-файлы (или подключить CSS Modules для новых виджетов) | 63 | ✅ (частично) |
| 8 | `@testing-library/react` + smoke-тесты топ-страниц (Dashboard / Profile / Activity / Performance Review / Teams) | 64 | ✅ (инфра + 3 файла) |

> #7 — текущий статус: вынесены два больших куска (`perf-review.css` 883 стр., `teams.css` 214 стр.).
> `global.css` ужался 3156 → 2060. Остальные блоки (Dashboard/Activity/Profile) — кандидаты на дальнейший
> распил по тому же шаблону: подкрасить файл по домену, добавить импорт в `main.tsx`.
| 9 | `FilterUrlSync` — один направленный поток, убрать `eslint-disable` | 65 | 🔜 |

> #8 — текущий статус: подключены RTL + jsdom + jest-dom matchers, vitest умеет per-file
> environment (`*.test.tsx → jsdom`, `*.test.ts → node`). Написаны 3 smoke-файла как шаблон:
> `EmptyState`, `ErrorBoundary`, `TeamScopePicker`. Page-level smoke (Dashboard / Profile /
> Activity / Perf-review / Teams) — следующая итерация: им нужны моки сторов или общая
> testing-render-обёртка с MemoryRouter + AntdProvider.
| 10 | `AbortController` в `apiClient` (отмена устаревших запросов) | 66 | ⬜ |

## Долгосрочные (через 3-6 месяцев, по триггеру роста кодбазы)

| # | Что | Стейдж | Статус |
|---|---|---|---|
| 11 | Миграция на TanStack Query (порог 5+ эндпоинт-сторов пройден) | 67 | ⬜ |
| 12 | Подгруппировка `widgets/` по доменам (`perf/`, `dashboard/`, `activity/`) | 68 | ⬜ |
| 13 | CSS Modules для всех виджетов (если CSS вырос ещё на 50%) | 69 | ⬜ |
| 14 | Виртуализация `TasksTimeline` (`@tanstack/react-virtual`) | 70 | ⬜ |

---

## Trade-offs по большим пунктам

### #11 TanStack Query
- **Стоимость:** 1-2 недели. 9 сторов → переписать сторы в `queryClient.useQuery`/`useMutation`.
- **Выгода:** dedupe, retry, stale-while-revalidate, devtools, минус ~300 строк store-инфры.
- **Trigger:** когда добавится 1-2 новых эндпоинт-стора, или backend пойдёт в WebSocket.

### #13 CSS Modules полностью
- **Стоимость:** 37 виджетов × ~20 классов = 700+ замен. ~3-5 дней.
- **Выгода:** локальные классы, защита от коллизий, чище наименование.
- **Trigger:** когда `global.css` перевалит 4500 строк.

### #14 Виртуализация
- **Стоимость:** 1-2 дня.
- **Выгода:** TasksTimeline не лагает на 1000+ карточек.
- **Trigger:** когда у клиента будет проект с такой плотностью карточек.
