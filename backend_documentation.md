# Backend documentation — MenuBoard (планировщик еды · ДЗ5)

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
  ├─ PostgREST → PostgreSQL (dishes, plan_entries, profiles)
  └─ RLS policies (только authenticated)
```

Выбран **вариант A: Supabase BaaS** (без self-hosted Postgres/Docker/VPS).

## 2. Схема БД

| Файл | Роль |
|------|------|
| `supabase/migrations/001_init.sql` | стартовая схема (исторический canteen) |
| `supabase/migrations/002_meal_planner.sql` | **meal planner** — убирает day/price, добавляет БЖУ + `plan_entries` |

**Итоговый домен — планировщик еды**, не столовая и не ключи кабинетов.

| Таблица | Назначение |
|---------|------------|
| `profiles` | профиль пользователя (`auth.users`) |
| `dishes` | каталог: `kind`, `calories`, `protein`, `fat`, `carbs`, `allergens` (**без `day`, без `price_rub`**) |
| `plan_entries` | план: `user_id` + `dish_id` + **`plan_date`** (+ опц. `meal_slot`) |

Связи: `plan_entries.dish_id → dishes.id`, `profiles.id → auth.users.id`, `plan_entries.user_id → auth.users.id`.

### Миграция

1. **Новый проект:** Run `001_init.sql`, затем **обязательно** `002_meal_planner.sql`.  
2. **Уже выполнен старый 001:** Run только `002_meal_planner.sql` (breaking: drop `day`/`price_rub`/`menu_picks`).

## 3. Развёртывание Supabase

**Важно:** новый проект Supabase для Сухановой / MenuBoard. Не KeyCabinet.

1. [https://supabase.com](https://supabase.com) → **New project**.  
2. SQL Editor → `001` → Run → `002` → Run.  
3. Auth Email; Confirm email можно выключить для учёбы.  
4. Site URL = `http://localhost:5173` (+ Vercel URL).  
5. Скопировать URL и anon key в `.env.local`.  

Без реальных ключей — **demo-режим**.

## 4. API (PostgREST)

Базовый URL: `{VITE_SUPABASE_URL}/rest/v1/`  
Заголовки: `apikey`, `Authorization: Bearer <access_token>`.

| Операция | Метод | Endpoint |
|----------|-------|----------|
| Read catalog | `GET` | `/dishes?select=*&order=kind` |
| Create dish | `POST` | `/dishes` |
| Update dish | `PATCH` | `/dishes?id=eq.…` |
| Delete dish | `DELETE` | `/dishes?id=eq.…` |
| Read plan | `GET` | `/plan_entries?select=*&order=plan_date` |
| Add to plan | `POST` | `/plan_entries` |
| Remove from plan | `DELETE` | `/plan_entries?id=eq.…` |

Пример создания блюда:

```bash
curl -X POST "$VITE_SUPABASE_URL/rest/v1/dishes" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"id":"d-okroshka","title":"Окрошка","kind":"soup","calories":200,"protein":8,"fat":6,"carbs":22,"allergens":[]}'
```

Клиент: `src/api/menuApi.ts`, `src/api/authApi.ts`.

## 5. Безопасность

- **Auth:** email + password.  
- **RLS:** CRUD `dishes` для `authenticated`; `plan_entries` — только свои строки (`auth.uid() = user_id`).  
- На клиенте только `anon` key; `service_role` не коммитится.  
- `.env` / `.env.local` в `.gitignore`.

## 6. Ошибки

`src/lib/apiErrors.ts`: 401 / 403 / 500 / сеть / валидация → баннеры в UI.

## 7. Тесты

```bash
npm test
```

Юнит-тесты без live Supabase (demo + mock). После `.env.local` — ручная проверка в браузере.

## 8. Деплой

См. [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md). После схемы meal planner: Redeploy Vercel + убедиться, что на Supabase выполнен **002**.
