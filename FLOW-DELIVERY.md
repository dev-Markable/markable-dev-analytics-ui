# Flow / Delivery — спека новой страницы

> Статус: **черновик / proposal**. Фронт-направление A из [`README.md`](./README.md#roadmap).
> Требует расширения бэка (`DevPulse-core`) и контракта (`@devpulse-dev/api-types`).
> Этот файл — про **что хотим от OAS и что нужно на бэке**, чтобы можно было
> завести задачи в `devpulse-oas` и `DevPulse-core` до старта фронта.

---

## 1. Зачем

Сейчас весь продукт — про **активность людей** (коммиты, ревью, activity-score).
Почти нет взгляда на **поток задач**: насколько быстро и предсказуемо команда
доводит работу до конца. У нас уже есть Kaiten-данные (карточки, дефекты,
cycle-time раздельно defects/development — см. `KaitenInsights` в Performance
Review), но они показаны **по одному разработчику** (досье к 1:1). Нет
**командного / бордового** среза потока во времени.

Flow-страница закрывает классические вопросы delivery-аналитики:

- сколько задач закрываем за период и растёт ли это (**throughput**);
- сколько времени задача живёт от старта до готовности и насколько разброс велик
  (**cycle time** — распределение, не среднее);
- сколько работы «в полёте» прямо сейчас и не раздут ли WIP (**WIP**);
- что **застряло** дольше всего (**aging work items**);
- копятся ли **дефекты** (приток vs отток);
- как выглядит поток в целом (**CFD** — cumulative flow diagram).

---

## 2. Страница `/flow` — виджеты

Каждый блок — отдельный виджет в `widgets/flow/*` (см. §6). Все уважают
глобальный фильтр периода и команды из топбара (`?from&to&team`), как остальные
страницы.

| Виджет | Что показывает | Метрика |
|---|---|---|
| **Throughput** | Кол-во закрытых карточек по интервалам (день/неделя) + тренд | time series `closed` |
| **Cycle time** | Гистограмма распределения + p50/p85, раздельно defects / development | распределение, перцентили |
| **WIP** | Сколько сейчас в работе по типам/колонкам | snapshot `inWork` |
| **Aging WIP** | Топ «застрявших» карточек в работе по возрасту | `ageDays` desc |
| **Defects flow** | Приток (открыто) vs отток (закрыто) дефектов по интервалам + накопление | две серии + cumulative |
| **CFD** | Накопленные карточки по статусам (NEW / IN_PROGRESS / DONE) по дням | stacked area по истории |

Переиспользуем готовое с других страниц: гистограмму/перцентили
(`widgets/activity/distribution` — `quantile`/`computeDistribution`/`histogram`),
формат cycle-time (`widgets/perf/kaiten-cycle` — `formatDays`), drill-down Drawer
(`widgets/activity/drilldown`) для «что под этим баром».

---

## 3. Источник данных и почему нужен бэк

Все метрики строятся над карточками Kaiten. Сейчас фронту доступен лишь
**срез карточек одного субъекта** (внутри Performance Review) и **per-developer
агрегаты**. Для Flow нужен **board/team-level доступ к карточкам и их временным
меткам**, которого в API v2 нет:

- нет эндпоинта «карточки за период по команде/борду» без привязки к субъекту;
- нет **временных рядов** (throughput/defects по интервалам);
- нет **исторических снапшотов статусов** (для CFD и трендов > 2 периодов).

Что бэк уже умеет (переиспользовать логику): cycle-time раздельно
defects/development (`CycleTimeBreakdown`), классификацию `cardType`
(`DEFECT`/`DEVELOPMENT`/…), `columnStatus` (`NEW`/`IN_PROGRESS`/`DONE`),
срочность дефектов (`UrgencyCounts`).

---

## 4. Контракт OAS — что хотим

Новый тег `flow` в `devpulse-oas`. Базовые query-параметры везде: `from`, `to`,
`team?` (как в `/stats/*`), плюс где уместно `type?` (`DEFECT|DEVELOPMENT|ALL`).
Ответы — `problem+json` на ошибках (как везде). Ниже — предлагаемые схемы
(OpenAPI-фрагменты + TS-алиасы для `shared/api/schema.ts`).

### 4.1 `GET /flow/throughput` — закрытия по интервалам

Считается из `closedAt` карточек в окне. **Не требует снапшотов.**

```yaml
parameters: [from, to, team?, type?, interval?]   # interval: day | week (default week)
responses:
  200:
    FlowThroughput:
      from: Date
      to: Date
      interval: { type: string, enum: [day, week] }
      buckets:
        - { date: Date, closed: int, opened: int }   # opened — из createdAt, для контекста
```

```ts
export type FlowThroughput = Schemas['FlowThroughput'];
```

### 4.2 `GET /flow/cycle-time` — распределение времени цикла

Нужны **сэмплы по карточкам** (а не только среднее, как в `CycleTimeBreakdown`),
чтобы фронт построил гистограмму и перцентили. Cycle = время от входа в
`IN_PROGRESS` до `DONE` (та же логика, что бэк уже применяет для среднего).

```yaml
parameters: [from, to, team?, type?]
responses:
  200:
    FlowCycleTime:
      from: Date
      to: Date
      samples:                       # завершённые в окне карточки
        - cardId: int64
          type: { enum: [DEFECT, DEVELOPMENT] }
          cycleTimeHours: double
          closedAt: DateTime
      # опционально — готовые перцентили, если выборка большая и сэмплы не нужны:
      percentiles: { p50: double, p85: double, p95: double }
```

> Альтернатива при больших объёмах: отдавать только `percentiles` + готовые
> bucket'ы гистограммы (`{ x0, x1, count }`), без пер-карточных сэмплов.
> Решаем по нагрузке; для MVP сэмплы проще (фронт уже умеет `histogram()`).

### 4.3 `GET /flow/wip` — работа в полёте (snapshot)

Текущее состояние, `columnStatus == IN_PROGRESS` на момент запроса. **Не требует
истории.** Включает aging — возраст карточки в работе.

```yaml
parameters: [team?, type?]
responses:
  200:
    FlowWip:
      asOf: DateTime
      byType:    { defects: int, development: int, other: int }
      byColumn:  [ { columnTitle: string, count: int } ]
      aging:                          # для виджета Aging WIP, отсортировано desc
        - cardId: int64
          title: string
          type: { enum: [DEFECT, DEVELOPMENT] }
          columnTitle: string
          ageDays: double             # сейчас − вход в IN_PROGRESS
          url: string                 # ссылка в Kaiten
          assignee: { email: Email, displayName: string?, avatarUrl: string? }?
```

```ts
export type FlowWip = Schemas['FlowWip'];
```

### 4.4 `GET /flow/defects` — приток vs отток дефектов

```yaml
parameters: [from, to, team?, interval?]
responses:
  200:
    FlowDefects:
      interval: { enum: [day, week] }
      buckets:
        - date: Date
          opened: int                 # createdAt в интервале
          closed: int                 # closedAt в интервале
          openCumulative: int         # накопленный backlog на конец интервала
        byUrgencyOpen: UrgencyCounts  # переиспользуем существующую схему
```

### 4.5 `GET /flow/cfd` — cumulative flow diagram ⚠️ нужны снапшоты

Для каждого дня — сколько карточек было в каждом статусе. Это **нельзя**
восстановить из текущих карточек: статус в прошлом неизвестен. Нужен
**ежедневный снапшот** распределения по статусам (см. §5).

```yaml
parameters: [from, to, team?, type?]
responses:
  200:
    FlowCfd:
      days:
        - { date: Date, new: int, inProgress: int, done: int }
```

---

## 5. Что нужно на бэке (`DevPulse-core`)

**Без новых хранилищ (можно сразу), считается из карточек + меток времени:**

1. `/flow/throughput` — группировка по `closedAt` / `createdAt` в интервалы.
2. `/flow/cycle-time` — пер-карточный cycle-time (логика уже есть для среднего в
   `CycleTimeBreakdown` — вынести на уровень карточки и отдать сэмплы).
3. `/flow/wip` + aging — выборка `columnStatus == IN_PROGRESS`, возраст от входа
   в работу. Нужен момент входа в `IN_PROGRESS` (если не хранится — приблизить
   `updatedAt`/историей колонок Kaiten).
4. `/flow/defects` — `cardType == DEFECT`, группировка по `createdAt`/`closedAt`.

**Требует исторических снапшотов (отдельная задача):**

5. **Ежедневный снапшот** числа карточек по `(team, type, columnStatus)` —
   джоб раз в сутки пишет строку в таблицу `flow_daily_snapshot`. На этом
   строятся:
   - `/flow/cfd` (cumulative flow),
   - **тренды > 2 периодов** (направление C) и **forecast**,
   - точная история WIP/backlog.

> Снапшоты — единый разблокиратор и для Flow-CFD, и для лонгитюда (C), и для
> push-алертов аномалий (B5, которым нужна история). Имеет смысл закладывать
> снапшот-таблицу как фундамент, а не только под CFD.

**Открытый вопрос к бэку:** где взять момент входа карточки в `IN_PROGRESS`
(для cycle-time и aging) — есть ли в Kaiten история переходов по колонкам, или
аппроксимируем. От этого зависит точность cycle-time и aging.

---

## 6. Клиентская реализация (FSD)

```
src/pages/flow/                     # FlowPage: грузит flow-запросы, раскладка секций
src/entities/flow/
  ├── model/types.ts                # алиасы на Schemas['Flow*']
  └── api/{flow.api.ts, queries.ts} # queryOptions-фабрики (как у stats/dashboard)
src/widgets/flow/
  ├── throughput/                   # bar/area time series (Recharts)
  ├── cycle-time/                   # переиспользует distribution histogram + перцентили
  ├── wip/                          # сводка + Aging-таблица (DataTable)
  ├── defects-flow/                 # две серии + cumulative
  └── cfd/                          # stacked area по дням
```

- Навигация: пункт в `widgets/app-layout/config/nav-items.ts` + `ROUTES.flow` +
  страница в `command-palette` (`PAGES` в `features/command-palette/lib/use-commands.ts`).
- Состояние — TanStack Query `queryOptions` per-эндпоинт, ключи включают
  `from/to/team/interval` → авто-refetch при смене фильтров (как везде).
- Lazy-роут (`React.lazy`), recharts уже вне инициального бандла.
- Чистые агрегации/форматтеры — в `lib/` с юнит-тестами (как принято).
- Drill-down (`widgets/activity/drilldown` или его обобщение) для «карточки под
  баром throughput / бакетом cycle-time».

---

## 7. Фазирование

- **MVP (без снапшотов):** Throughput, Cycle-time (распределение), WIP + Aging,
  Defects flow. Покрывает 80% ценности, нужен только board/team-доступ к
  карточкам и метки времени.
- **Phase 2 (снапшоты):** CFD + точная история WIP/backlog. Закладывает фундамент
  под направление C (тренды/forecast) и B5 (история аномалий).

---

## 8. Открытые вопросы

1. Момент входа в `IN_PROGRESS` — есть ли история колонок Kaiten? (точность
   cycle-time / aging).
2. `/flow/cycle-time` — сэмплы по карточкам или готовые перцентили+бакеты?
   (зависит от объёмов).
3. Привязка карточки к команде — по assignee.team или по борду/пространству?
   (как трактуем `team?` в Kaiten-контексте — у карточки нет `team` напрямую).
4. Часовой пояс интервалов (как с hourly — «локальное время сервера сбора»).
5. Нужен ли drill-down карточек в Kaiten по ссылке (`url`) прямо из таблиц.
