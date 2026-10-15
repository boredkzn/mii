-- MenuBoard · ДЗ5 · начальная схема (PostgreSQL / Supabase)
-- Домен: электронное меню столовой (не KeyCabinet)
-- Выполнить в Supabase Dashboard → SQL Editor → New query → Run

-- ---------------------------------------------------------------------------
-- 1. Таблицы
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'diner'
    check (role in ('diner', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.dishes (
  id text primary key,
  title text not null,
  kind text not null
    check (kind in ('soup', 'main', 'salad', 'drink')),
  day text not null
    check (day in ('mon', 'tue', 'wed', 'thu', 'fri')),
  calories integer not null check (calories >= 0),
  allergens text[] not null default '{}',
  price_rub integer not null check (price_rub >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dish_id text not null references public.dishes (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, dish_id)
);

create index if not exists dishes_day_idx on public.dishes (day);
create index if not exists dishes_kind_idx on public.dishes (kind);
create index if not exists menu_picks_user_id_idx on public.menu_picks (user_id);
create index if not exists menu_picks_dish_id_idx on public.menu_picks (dish_id);

-- ---------------------------------------------------------------------------
-- 2. Триггер: профиль при регистрации
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dishes_set_updated_at on public.dishes;
create trigger dishes_set_updated_at
  before update on public.dishes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Seed (демо-меню столовой «Зелёный угол»)
-- ---------------------------------------------------------------------------

insert into public.dishes (id, title, kind, day, calories, allergens, price_rub)
values
  ('d-mon-soup', 'Борщ со сметаной', 'soup', 'mon', 320, array['молоко'], 120),
  ('d-mon-main', 'Котлета куриная с гречкой', 'main', 'mon', 540, array['глютен'], 210),
  ('d-mon-salad', 'Винегрет', 'salad', 'mon', 180, '{}', 90),
  ('d-tue-soup', 'Куриный суп с лапшой', 'soup', 'tue', 280, array['глютен', 'яйцо'], 110),
  ('d-tue-main', 'Рыба запечённая с овощами', 'main', 'tue', 410, array['рыба'], 240),
  ('d-tue-drink', 'Компот из сухофруктов', 'drink', 'tue', 90, '{}', 50),
  ('d-wed-main', 'Плов с говядиной', 'main', 'wed', 620, '{}', 230),
  ('d-wed-salad', 'Цезарь с курицей', 'salad', 'wed', 350, array['молоко', 'глютен', 'яйцо'], 180),
  ('d-thu-soup', 'Грибной крем-суп', 'soup', 'thu', 260, array['молоко'], 130),
  ('d-thu-main', 'Индейка с киноа', 'main', 'thu', 480, '{}', 250),
  ('d-fri-main', 'Паста карбонара', 'main', 'fri', 590, array['глютен', 'молоко', 'яйцо'], 220),
  ('d-fri-drink', 'Морс клюквенный', 'drink', 'fri', 70, '{}', 55)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.dishes enable row level security;
alter table public.menu_picks enable row level security;

-- profiles: читать/править только свой профиль
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- dishes: authenticated — полный CRUD меню
drop policy if exists "dishes_select_authenticated" on public.dishes;
create policy "dishes_select_authenticated"
  on public.dishes for select
  to authenticated
  using (true);

drop policy if exists "dishes_insert_authenticated" on public.dishes;
create policy "dishes_insert_authenticated"
  on public.dishes for insert
  to authenticated
  with check (true);

drop policy if exists "dishes_update_authenticated" on public.dishes;
create policy "dishes_update_authenticated"
  on public.dishes for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "dishes_delete_authenticated" on public.dishes;
create policy "dishes_delete_authenticated"
  on public.dishes for delete
  to authenticated
  using (true);

-- menu_picks: пользователь видит и меняет только свои выборы
drop policy if exists "picks_select_own" on public.menu_picks;
create policy "picks_select_own"
  on public.menu_picks for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "picks_insert_own" on public.menu_picks;
create policy "picks_insert_own"
  on public.menu_picks for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "picks_delete_own" on public.menu_picks;
create policy "picks_delete_own"
  on public.menu_picks for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 6. Auth (заметки для Dashboard)
-- ---------------------------------------------------------------------------
-- Authentication → Providers → Email: включить Email.
-- Для учебного проекта можно отключить «Confirm email» (Auth → Providers → Email),
-- чтобы вход email/password работал сразу после Sign up.
-- Site URL / Redirect URLs: http://localhost:5173 (и URL Vercel при деплое).
-- CORS настраивать не нужно — Supabase разрешает браузерные запросы с anon key.
-- ВАЖНО: создайте ОТДЕЛЬНЫЙ проект Supabase для MenuBoard (не KeyCabinet).
