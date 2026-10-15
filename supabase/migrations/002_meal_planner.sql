-- MenuBoard · миграция к планировщику еды (meal planner)
-- Домен: каталог блюд + план по календарным датам (НЕ столовая, НЕ KeyCabinet)
--
-- КОГДА ЗАПУСКАТЬ
--   • Уже выполнен старый 001_init.sql (canteen: day, price_rub, menu_picks)
--     → выполните ТОЛЬКО этот файл 002 в SQL Editor.
--   • Новый проект с нуля:
--     1) выполните 001_init.sql (создаст profiles + базовые объекты)
--     2) затем ОБЯЗАТЕЛЬНО 002_meal_planner.sql (переведёт схему на meal planner)
--
-- ИТОГОВАЯ СХЕМА
--   dishes: id, title, kind, calories, protein, fat, carbs, allergens  (без day, без price)
--   plan_entries: user_id, dish_id, plan_date, meal_slot?
--   profiles: без изменений
--
-- Breaking: удаляются колонки day/price_rub и таблица menu_picks.

-- ---------------------------------------------------------------------------
-- 1. plan_entries (план питания по датам)
-- ---------------------------------------------------------------------------

create table if not exists public.plan_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dish_id text not null references public.dishes (id) on delete cascade,
  plan_date date not null,
  meal_slot text null
    check (meal_slot is null or meal_slot in ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at timestamptz not null default now(),
  unique (user_id, dish_id, plan_date)
);

create index if not exists plan_entries_user_id_idx on public.plan_entries (user_id);
create index if not exists plan_entries_plan_date_idx on public.plan_entries (plan_date);
create index if not exists plan_entries_dish_id_idx on public.plan_entries (dish_id);

-- ---------------------------------------------------------------------------
-- 2. dishes: убрать день/цену, добавить БЖУ
-- ---------------------------------------------------------------------------

-- Снять старые ограничения / индексы дня (если есть)
drop index if exists public.dishes_day_idx;

alter table public.dishes drop constraint if exists dishes_day_check;
alter table public.dishes drop column if exists day;
alter table public.dishes drop column if exists price_rub;

alter table public.dishes
  add column if not exists protein numeric not null default 0
    check (protein >= 0);

alter table public.dishes
  add column if not exists fat numeric not null default 0
    check (fat >= 0);

alter table public.dishes
  add column if not exists carbs numeric not null default 0
    check (carbs >= 0);

-- Расширить kind: snack
alter table public.dishes drop constraint if exists dishes_kind_check;
alter table public.dishes
  add constraint dishes_kind_check
  check (kind in ('soup', 'main', 'salad', 'drink', 'snack'));

-- ---------------------------------------------------------------------------
-- 3. Удалить menu_picks (заменён на plan_entries)
-- ---------------------------------------------------------------------------

drop policy if exists "picks_select_own" on public.menu_picks;
drop policy if exists "picks_insert_own" on public.menu_picks;
drop policy if exists "picks_delete_own" on public.menu_picks;
drop table if exists public.menu_picks;

-- ---------------------------------------------------------------------------
-- 4. Seed каталога (единый, без дней)
-- ---------------------------------------------------------------------------

-- Очистить старые seed-id столовой (если остались)
delete from public.dishes
where id like 'd-mon-%'
   or id like 'd-tue-%'
   or id like 'd-wed-%'
   or id like 'd-thu-%'
   or id like 'd-fri-%';

insert into public.dishes (id, title, kind, calories, protein, fat, carbs, allergens)
values
  ('d-borscht', 'Борщ со сметаной', 'soup', 320, 12, 14, 32, array['молоко']),
  ('d-chicken-cutlet', 'Котлета куриная с гречкой', 'main', 540, 38, 22, 48, array['глютен']),
  ('d-vinaigrette', 'Винегрет', 'salad', 180, 4, 8, 22, '{}'),
  ('d-chicken-noodle', 'Куриный суп с лапшой', 'soup', 280, 18, 8, 28, array['глютен', 'яйцо']),
  ('d-baked-fish', 'Рыба запечённая с овощами', 'main', 410, 36, 18, 20, array['рыба']),
  ('d-compote', 'Компот из сухофруктов', 'drink', 90, 0, 0, 22, '{}'),
  ('d-plov', 'Плов с говядиной', 'main', 620, 28, 24, 72, '{}'),
  ('d-caesar', 'Цезарь с курицей', 'salad', 350, 26, 20, 14, array['молоко', 'глютен', 'яйцо']),
  ('d-mushroom-soup', 'Грибной крем-суп', 'soup', 260, 8, 16, 18, array['молоко']),
  ('d-turkey-quinoa', 'Индейка с киноа', 'main', 480, 42, 14, 40, '{}'),
  ('d-carbonara', 'Паста карбонара', 'main', 590, 24, 28, 58, array['глютен', 'молоко', 'яйцо']),
  ('d-cranberry', 'Морс клюквенный', 'drink', 70, 0, 0, 17, '{}')
on conflict (id) do update set
  title = excluded.title,
  kind = excluded.kind,
  calories = excluded.calories,
  protein = excluded.protein,
  fat = excluded.fat,
  carbs = excluded.carbs,
  allergens = excluded.allergens;

-- ---------------------------------------------------------------------------
-- 5. RLS для plan_entries
-- ---------------------------------------------------------------------------

alter table public.plan_entries enable row level security;

drop policy if exists "plan_select_own" on public.plan_entries;
create policy "plan_select_own"
  on public.plan_entries for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "plan_insert_own" on public.plan_entries;
create policy "plan_insert_own"
  on public.plan_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "plan_update_own" on public.plan_entries;
create policy "plan_update_own"
  on public.plan_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "plan_delete_own" on public.plan_entries;
create policy "plan_delete_own"
  on public.plan_entries for delete
  to authenticated
  using (auth.uid() = user_id);

-- dishes RLS уже есть из 001 (authenticated CRUD) — оставляем.

-- ---------------------------------------------------------------------------
-- 6. Заметки
-- ---------------------------------------------------------------------------
-- После 002: Redeploy фронта на Vercel и проверьте CRUD + план по дате.
-- Не используйте ключи KeyCabinet — отдельный проект Supabase для MenuBoard.
