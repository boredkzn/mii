# MenuBoard → Vercel (чеклист)

Клиентский Vite SPA. `vercel.json` не нужен — корень репозитория = корень деплоя.  
Секреты только в Vercel Env / локальном `.env.local` — **не в Git**.

Используйте **свой** проект Supabase (MenuBoard), не ключи KeyCabinet.

## 1. Репозиторий

GitHub: https://github.com/sukhanovaKL/MenuBoard  
Ветка для деплоя: `main`. После `git push` Vercel подхватит коммит (если проект связан).

## 2. Импорт в Vercel (первый раз)

1. [vercel.com](https://vercel.com) → **Log in** → **Continue with GitHub**.
2. **Add New…** → **Project** → **Import** репозиторий **MenuBoard**.
3. Framework Preset: **Vite**.
4. Build: `npm run build` · Output: `dist` · Install: `npm install`.
5. **Environment Variables** (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (`anon` / publishable, не `service_role`)
6. **Deploy**.

## 3. После деплоя

1. Скопируйте URL вида `https://….vercel.app`.
2. Supabase → **Authentication** → **URL Configuration**:
   - **Site URL** = production URL
   - **Redirect URLs** = production + `http://localhost:5173`
3. Убедитесь, что выполнены миграции `001_init.sql` **и** [`002_meal_planner.sql`](./supabase/migrations/002_meal_planner.sql).
4. Проверьте: регистрация / вход, каталог CRUD, календарь, «В план на дату», панель «Выбранные позиции» (КБЖУ).

## Локально

```bash
cp .env.example .env.local   # вставить свои значения вместо PASTE_…
npm install
npm test
npm run build
npm run dev
```

Шаблон: [`.env.example`](./.env.example).  
Архитектура: [`backend_documentation.md`](./backend_documentation.md).
