# Backend documentation — MenuBoard (ДЗ5)

**Студент:** Ксения Суханова  
**Стек:** React (Vite) + Supabase (PostgreSQL, Auth, PostgREST, RLS)  
**См. также:** [README.md](./README.md) · [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) · [`.env.example`](./.env.example)

## 1. Архитектура

```
Browser (Vite/React)
    │  @supabase/supabase-js
    │  HTTPS + JWT (anon key + user session)
    ▼
Supabase Cloud (отдельный проект для MenuBoard)
  ├─ Auth (email/password)
  ├─ PostgREST → PostgreSQL (dishes, menu_picks, profiles)
  └─ RLS policies (только authenticated)
```

Выбран **вариант A: Supabase BaaS** (без self-hosted Postgres/Docker/VPS):

| Критерий | Supabase | Self-hosted |
|----------|----------|-------------|
| Время старта | минуты | часы (VPS, Docker, TLS) |
| Auth + RLS | из коробки | писать middleware |
| PostgREST API | автогенерация | отдельный сервис |
| Стоимость для ДЗ | Free tier | аренда сервера |
| CORS | по умолчанию ок | настраивать |

## 2. Схема БД

Миграция: `supabase/migrations/001_init.sql`  
Домен — **меню столовой**, не ключи кабинетов.

| Таблица | Назначение |
|---------|------------|
| `profiles` | профиль пользователя (`auth.users`) |
| `dishes` | блюда: день, тип, калории, аллергены, цена |
| `menu_picks` | выбор блюд пользователем (`user_id` + `dish_id`) |

Связи: `menu_picks.dish_id → dishes.id`, `profiles.id → auth.users.id`, `menu_picks.user_id → auth.users.id`.

## 3. Развёртывание Supabase

**Важно:** создайте **новый** проект Supabase для Сухановой / MenuBoard.  
Не переиспользуйте URL и anon key KeyCabinet.

1. Зарегистрироваться на [https://supabase.com](https://supabase.com), **New project**.
2. Дождаться готовности БД.
3. **SQL Editor** → вставить содержимое `001_init.sql` → **Run**.
4. **Authentication → Providers → Email**: включить; Confirm email можно выключить для учёбы.
5. **Authentication → URL Configuration**: Site URL = `http://localhost:5173`.
6. **Project Settings → API**: скопировать Project URL и `anon` `public` key.
7. В корне: заполнить `.env.local` (вместо `PASTE_…`).
8. `npm install && npm run dev` → Регистрация в UI.

Без реальных ключей приложение работает в **demo-режиме**.

### Что сделать вручную (логин)

Агент не создаёт облачный проект за студента. Нужно:

1. Войти в Supabase Dashboard.  
2. Создать проект.  
3. Выполнить SQL-миграцию.  
4. Вставить URL и anon key в `.env.local`.  
5. Зарегистрировать пользователя через UI («Регистрация»).

## 4. API (PostgREST)

Базовый URL: `{VITE_SUPABASE_URL}/rest/v1/`  
Заголовки: `apikey: <anon>`, `Authorization: Bearer <access_token>`, `Content-Type: application/json`.

### CRUD (минимум 3+ операции)

| Операция | Метод | Endpoint | Описание |
|----------|-------|----------|----------|
| Read | `GET` | `/dishes?select=*&order=day` | список блюд |
| Create | `POST` | `/dishes` | добавить блюдо |
| Update | `PATCH` | `/dishes?id=eq.d-mon-soup` | изменить блюдо |
| Delete | `DELETE` | `/dishes?id=eq.…` | удалить блюдо |
| Create pick | `POST` | `/menu_picks` | «Возьму» |
| Delete pick | `DELETE` | `/menu_picks?id=eq.…` | убрать из выбора |

Пример чтения:

```bash
curl "$VITE_SUPABASE_URL/rest/v1/dishes?select=id,title,day,kind,price_rub&order=day" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Пример создания:

```bash
curl -X POST "$VITE_SUPABASE_URL/rest/v1/dishes" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"id":"d-fri-soup","title":"Окрошка","kind":"soup","day":"fri","calories":200,"allergens":[],"price_rub":100}'
```

Клиентский слой: `src/api/menuApi.ts`, `src/api/authApi.ts`.

## 5. Безопасность

- **Auth:** email + password (Supabase Auth).
- **RLS:** на всех таблицах; CRUD по `dishes` только для `authenticated`; `menu_picks` — только свои строки (`auth.uid() = user_id`).
- **Секреты:** только `anon` key на клиенте; `service_role` не используется и не коммитится.
- **CORS:** стандартный для Supabase.
- **`.env` / `.env.local` в `.gitignore`**.

Без сессии запросы к таблицам получают **401/403** — UI показывает баннеры.

## 6. Обработка ошибок

`src/lib/apiErrors.ts` нормализует:

| Код | UI |
|-----|-----|
| 401 | «Требуется вход…» |
| 403 | «Доступ запрещён… RLS…» |
| 500 | «Ошибка сервера… Logs в Dashboard» |
| сеть | «Нет связи с сервером…» |
| валидация | текст правила (пустое название и т.п.) |

Логи: **Supabase → Logs → API / Postgres / Auth**.

## 7. Тестирование

```bash
npm test
```

25 юнит-тестов **без live Supabase** (demo + mock). После заполнения `.env.local` — ручная e2e проверка в браузере.

## 8. Деплой фронта (Vercel)

См. [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md).

## 9. Процесс разработки с AI

1. Описание сущностей MenuBoard (блюда, дни, выбор) → генерация SQL + RLS.  
2. Клиент `@supabase/supabase-js` и CRUD в `menuApi`.  
3. Demo-fallback и обработка 401/403/500.  
4. Vitest (API, ошибки, UI).  
5. Документация и отчёт ДЗ5 (автор — Суханова).
