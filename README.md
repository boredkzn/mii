# MenuBoard — планировщик еды

**RU:** Планировщик питания / meal planner. Курсовое задание **ДЗ5** (МИИ) — fullstack: React-клиент + backend на Supabase.

**EN:** Personal meal planner (dish catalog + calendar plan) — homework **HW5**: React frontend with Supabase (Postgres, Auth, RLS, PostgREST).

| | |
|---|---|
| **Студент / Author** | Ксения Суханова |
| **Дисциплина** | Методы искусственного интеллекта · ДЗ5 |
| **База** | MenuBoard (canteen mock) → **планировщик еды** + live CRUD |
| **Репозиторий** | https://github.com/sukhanovaKL/MenuBoard |

## Стек / Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4
- **Backend:** Supabase — PostgreSQL, Auth (email/password), Row Level Security (RLS), PostgREST
- **Tests:** Vitest + Testing Library
- **Deploy:** GitHub → [Vercel](https://vercel.com) (SPA)

## Возможности / Features

1. **Единый каталог блюд** — блюдо добавляется один раз и доступно на любую дату  
2. **Календарь** — выбор конкретной даты и план питания на неё  
3. Панель **«Выбранные позиции»** с итогами **КБЖУ** (ккал, белки, жиры, углеводы); цены нет  
4. **CRUD** каталога: Create / Read / Update / Delete  
5. Auth + RLS при подключении собственного проекта Supabase  
6. **Demo-режим** без рабочих ключей в `.env.local` — данные в памяти  

## Быстрый старт / Local run

```bash
npm install
cp .env.example .env.local   # оставьте PASTE_… → demo; или вставьте свои ключи
npm run dev                  # http://localhost:5173
```

| Команда | Описание |
|---------|----------|
| `npm run dev` | dev-сервер Vite |
| `npm test` | Vitest |
| `npm run build` | production-сборка в `dist/` |
| `npm run preview` | превью сборки |

Реальные секреты **не коммитить** — шаблон только в [`.env.example`](./.env.example).

### Rider

Проект: `~/RiderProjects/MenuBoard/` (`package.json` в корне).  
Run Configuration **npm: dev** → Run ▶ → `http://localhost:5173`.

## База данных / Database

| Файл | Когда |
|------|--------|
| [`001_init.sql`](./supabase/migrations/001_init.sql) | базовая схема (исторический canteen) |
| [`002_meal_planner.sql`](./supabase/migrations/002_meal_planner.sql) | **обязательно** — планировщик: каталог + `plan_entries` |

**Новый проект:** выполните `001`, затем **`002`**.  
**Уже крутили старый 001:** достаточно **`002`**.

| Таблица | Назначение |
|---------|------------|
| `dishes` | каталог: тип, ккал, белки/жиры/углеводы, аллергены (**без дня, без цены**) |
| `plan_entries` | план пользователя: `dish_id` + **`plan_date`** (+ опционально `meal_slot`) |
| `profiles` | профиль пользователя (`auth.users`) |

### Отдельный проект Supabase (обязательно)

**Не копируйте** ключи из KeyCabinet / Зарипова. Создайте **новый** проект для MenuBoard / Сухановой:

1. [supabase.com](https://supabase.com) → **New project**.
2. **SQL Editor** → `001_init.sql` → **Run** → затем `002_meal_planner.sql` → **Run**.
3. **Auth → Providers → Email**: включить (для учёбы можно отключить Confirm email).
4. **Auth → URL Configuration**: Site URL `http://localhost:5173` (и URL Vercel после деплоя).
5. **Settings → API**: Project URL и `anon` `public` key → в `.env.local`.

Пока в `.env.local` стоят `PASTE_…`, приложение работает в **demo**.

Подробности: [`backend_documentation.md`](./backend_documentation.md).

## Тесты / Tests

```bash
npm test
```

Юнит-тесты **без live Supabase** (demo + mock): логика КБЖУ/дат, API, ошибки, UI.

## Деплой / Deploy

Чеклист: [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md). Env на Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

После пуша: **Redeploy** на Vercel и выполните **`002_meal_planner.sql`** в Supabase, если ещё не запускали.

## Документация / Docs

| Файл | Содержание |
|------|------------|
| [`backend_documentation.md`](./backend_documentation.md) | архитектура, схема БД, PostgREST, RLS |
| [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md) | чеклист деплоя |
| [`.env.example`](./.env.example) | шаблон env |

## Структура проекта

```
MenuBoard/
├── supabase/migrations/
│   ├── 001_init.sql
│   └── 002_meal_planner.sql
└── src/
    ├── api/          # authApi, menuApi (dishes + plan_entries)
    ├── components/   # DishCard, DishForm, DatePicker, SelectedPanel…
    ├── data/         # seed каталога
    ├── utils/        # фильтры, КБЖУ
    └── App.tsx
```

## Git / GitHub

Публичный репозиторий: **https://github.com/sukhanovaKL/MenuBoard** (не `boredkzn`).

```bash
cd ~/RiderProjects/MenuBoard
gh api user --jq .login   # ожидается sukhanovaKL
git push -u origin main
```

## Сдача ДЗ5

Пакет на Desktop: `~/Desktop/МИИ Суханова/MII5 Суханова/` (отчёт + `submission/`).
