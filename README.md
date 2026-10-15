# MenuBoard

**RU:** Электронное меню столовой «Зелёный угол». Курсовое задание **ДЗ5** (МИИ) — fullstack: React-клиент + backend на Supabase.

**EN:** Cafeteria weekly menu board — homework **HW5** (AI Methods): React frontend with Supabase (Postgres, Auth, RLS, PostgREST).

| | |
|---|---|
| **Студент / Author** | Ксения Суханова |
| **Дисциплина** | Методы искусственного интеллекта · ДЗ5 |
| **База ДЗ4** | MenuBoard (mock-меню) → расширено до live CRUD |
| **Репозиторий** | https://github.com/sukhanovaKL/MenuBoard |

## Стек / Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4
- **Backend:** Supabase — PostgreSQL, Auth (email/password), Row Level Security (RLS), PostgREST
- **Tests:** Vitest + Testing Library (25 tests)
- **Deploy:** GitHub → [Vercel](https://vercel.com) (SPA)

## Возможности / Features

1. Меню по дням недели (Пн–Пт), фильтр по типу блюда и скрытие аллергена  
2. Выбор блюд («Возьму») с подсчётом суммы и калорий  
3. **CRUD блюд:** Create / Read / Update / Delete  
4. Auth + RLS при подключении собственного проекта Supabase  
5. **Demo-режим** без рабочих ключей в `.env.local` — данные в памяти  

## Быстрый старт / Local run

```bash
npm install
cp .env.example .env.local   # оставьте PASTE_… → demo; или вставьте свои ключи
npm run dev                  # http://localhost:5173
```

| Команда | Описание |
|---------|----------|
| `npm run dev` | dev-сервер Vite |
| `npm test` | Vitest (25 тестов) |
| `npm run build` | production-сборка в `dist/` |
| `npm run preview` | превью сборки |

Реальные секреты **не коммитить** — шаблон только в [`.env.example`](./.env.example).

### Rider

Проект: `~/RiderProjects/MenuBoard/` (`package.json` в корне).  
Run Configuration **npm: dev** → Run ▶ → `http://localhost:5173`.  
Также полезны **npm: test** и **npm: build**.

## База данных / Database

Миграция: [`supabase/migrations/001_init.sql`](./supabase/migrations/001_init.sql)

| Таблица | Назначение |
|---------|------------|
| `dishes` | блюда меню (день, тип, калории, аллергены, цена) |
| `menu_picks` | выбор блюд пользователем |
| `profiles` | профиль пользователя (`auth.users`) |

### Отдельный проект Supabase (обязательно)

**Не копируйте** ключи из KeyCabinet / Зарипова. Создайте **новый** проект для MenuBoard / Сухановой:

1. [supabase.com](https://supabase.com) → **New project**.
2. **SQL Editor** → вставьте `001_init.sql` → **Run**.
3. **Auth → Providers → Email**: включить (для учёбы можно отключить Confirm email).
4. **Auth → URL Configuration**: Site URL `http://localhost:5173` (и URL Vercel после деплоя).
5. **Settings → API**: Project URL и `anon` `public` key → в `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

6. `npm run dev` → **Регистрация** → CRUD и выбор блюд.

Пока в `.env.local` стоят `PASTE_…`, приложение работает в **demo**.

Подробности API и RLS: [`backend_documentation.md`](./backend_documentation.md).

## Тесты / Tests

```bash
npm test
```

**25 тестов** без live Supabase:

- `menuLogic` — дни, фильтры, сумма выбора  
- `apiErrors` — 401 / 403 / 500 / сеть  
- `menuApi` — demo CRUD + mock PostgREST  
- UI: `App`, `DayTabs`  

## Деплой / Deploy

Чеклист: [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md). Env на Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Документация / Docs

| Файл | Содержание |
|------|------------|
| [`backend_documentation.md`](./backend_documentation.md) | архитектура, схема БД, PostgREST, RLS |
| [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md) | чеклист деплоя |
| [`.env.example`](./.env.example) | шаблон env |
| [`docs/technical_specification.md`](./docs/technical_specification.md) | ТЗ (ДЗ4) |
| [`docs/development_report.md`](./docs/development_report.md) | отчёт по процессу |
| [`docs/Отчет_ДЗ5_Суханова.docx`](./docs/Отчет_ДЗ5_Суханова.docx) | отчёт ДЗ5 (Word) |

## Структура проекта

```
MenuBoard/
├── index.html
├── package.json
├── .env.example
├── README.md
├── DEPLOY_VERCEL.md
├── backend_documentation.md
├── docs/
├── scripts/generate_dz5_report.py
├── supabase/migrations/001_init.sql
└── src/
    ├── api/          # authApi, menuApi
    ├── components/   # DishCard, DishForm, AuthPanel, DayTabs…
    ├── data/         # seed MENU
    ├── lib/          # supabase, apiErrors
    ├── types/
    ├── utils/
    ├── App.tsx
    └── main.tsx
```

## Git / GitHub

Публичный репозиторий на аккаунте Сухановой: **https://github.com/sukhanovaKL/MenuBoard** (не `boredkzn`).

```bash
cd ~/RiderProjects/MenuBoard
gh api user --jq .login   # ожидается sukhanovaKL
git push -u origin main
```

## Сдача ДЗ5

Пакет на Desktop: `~/Desktop/МИИ Суханова/MII5 Суханова/` (отчёт + `submission/`).
