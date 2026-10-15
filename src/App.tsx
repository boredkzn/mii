import { useEffect, useMemo, useState } from 'react'
import { getAuthSnapshot, onAuthChange, type AuthSnapshot } from './api/authApi'
import {
  createDishRemote,
  deleteDishRemote,
  fetchDishes,
  fetchPicks,
  getDataMode,
  togglePickRemote,
  updateDishRemote,
} from './api/menuApi'
import { AuthPanel } from './components/AuthPanel'
import { DayTabs } from './components/DayTabs'
import { DishCard } from './components/DishCard'
import { DishForm } from './components/DishForm'
import { MenuFilters } from './components/MenuFilters'
import { MENU, type Dish, type DishKind, type Weekday } from './data/menu'
import { toApiError } from './lib/apiErrors'
import type { DishInput } from './types/menu'
import { dishesForDay, filterDishes, sumPicked } from './utils/menuLogic'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const [menu, setMenu] = useState<Dish[]>(MENU)
  const [picked, setPicked] = useState<string[]>([])
  const [day, setDay] = useState<Weekday>('mon')
  const [kind, setKind] = useState<'all' | DishKind>('all')
  const [allergen, setAllergen] = useState('')
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [banner, setBanner] = useState<string | null>(null)
  const [editing, setEditing] = useState<Dish | null>(null)
  const [auth, setAuth] = useState<AuthSnapshot>({
    user: null,
    session: null,
    demo: getDataMode() === 'demo',
  })
  const [bootDone, setBootDone] = useState(false)

  const dayDishes = useMemo(() => dishesForDay(menu, day), [menu, day])
  const visible = useMemo(
    () => filterDishes(dayDishes, kind, allergen),
    [dayDishes, kind, allergen],
  )
  const totals = useMemo(() => sumPicked(menu, picked), [menu, picked])
  const mode = getDataMode()
  const needsAuth = mode === 'supabase' && !auth.user
  const canManage = mode === 'demo' || Boolean(auth.user)

  useEffect(() => {
    let cancelled = false
    const unsub = onAuthChange((snap) => {
      if (!cancelled) setAuth(snap)
    })

    async function boot() {
      setLoadState('loading')
      try {
        const snap = await getAuthSnapshot()
        if (cancelled) return
        setAuth(snap)
        const [list, picks] = await Promise.all([fetchDishes(), fetchPicks()])
        if (cancelled) return
        setMenu(list)
        setPicked(picks)
        setLoadState('success')
      } catch (err) {
        if (cancelled) return
        const apiErr = toApiError(err)
        setLoadState('error')
        setBanner(apiErr.message)
      } finally {
        if (!cancelled) setBootDone(true)
      }
    }

    void boot()
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  async function reloadAll() {
    const [list, picks] = await Promise.all([fetchDishes(), fetchPicks()])
    setMenu(list)
    setPicked(picks)
  }

  async function handleToggle(dishId: string) {
    if (needsAuth) {
      const msg = 'Требуется вход (401). Войдите или зарегистрируйтесь.'
      setLoadState('error')
      setBanner(msg)
      return
    }
    setLoadState('loading')
    setBanner(null)
    try {
      const next = await togglePickRemote(dishId)
      setPicked(next)
      setLoadState('success')
      setBanner('Выбор обновлён')
    } catch (err) {
      const apiErr = toApiError(err)
      setLoadState('error')
      setBanner(apiErr.message)
    }
  }

  async function handleCreateOrUpdate(input: DishInput) {
    if (needsAuth) {
      const msg = 'Требуется вход (401). Войдите или зарегистрируйтесь.'
      setLoadState('error')
      setBanner(msg)
      throw new Error(msg)
    }
    setLoadState('loading')
    setBanner(null)
    try {
      const next = editing
        ? await updateDishRemote(editing.id, input)
        : await createDishRemote(input)
      setMenu(next)
      setEditing(null)
      setLoadState('success')
      setBanner(editing ? 'Блюдо обновлено' : 'Блюдо добавлено')
    } catch (err) {
      const apiErr = toApiError(err)
      setLoadState('error')
      setBanner(apiErr.message)
      throw apiErr
    }
  }

  async function handleDelete(dishId: string) {
    if (needsAuth) {
      const msg = 'Требуется вход (401). Войдите или зарегистрируйтесь.'
      setLoadState('error')
      setBanner(msg)
      return
    }
    setLoadState('loading')
    setBanner(null)
    try {
      const next = await deleteDishRemote(dishId)
      setMenu(next)
      setPicked((prev) => prev.filter((id) => id !== dishId))
      if (editing?.id === dishId) setEditing(null)
      setLoadState('success')
      setBanner('Блюдо удалено')
    } catch (err) {
      const apiErr = toApiError(err)
      setLoadState('error')
      setBanner(apiErr.message)
    }
  }

  async function handleAuthChange(snap: AuthSnapshot) {
    setAuth(snap)
    setBanner(null)
    try {
      await reloadAll()
      setLoadState('success')
    } catch (err) {
      const apiErr = toApiError(err)
      setLoadState('error')
      setBanner(apiErr.message)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6">
      <header className="rounded-3xl border border-[var(--mb-line)] bg-[var(--mb-forest)] px-5 py-6 text-[var(--mb-cream)] shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b7d4c4]">
          Столовая «Зелёный угол»
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">MenuBoard</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#d7ebe0] sm:text-base">
          Электронное меню на неделю: CRUD блюд, фильтры, аллергены и выбор на
          обед — с Supabase или в demo-режиме.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#9fbfae]">
          <p data-testid="load-state">Состояние: {loadState}</p>
          <p data-testid="data-mode">Режим: {mode === 'demo' ? 'demo' : 'supabase'}</p>
        </div>
      </header>

      <AuthPanel
        auth={auth}
        onAuthChange={handleAuthChange}
        onError={(m) => {
          setLoadState('error')
          setBanner(m)
        }}
      />

      {banner && (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            loadState === 'error'
              ? 'border-rose-300 bg-rose-50 text-rose-800'
              : 'border-emerald-300 bg-emerald-50 text-emerald-900'
          }`}
          role="status"
          data-testid="app-banner"
        >
          {banner}
        </div>
      )}

      {needsAuth && bootDone && (
        <div
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
          role="alert"
          data-testid="auth-required"
        >
          Backend подключён. Для чтения/записи меню войдите (RLS требует{' '}
          <code>authenticated</code>).
        </div>
      )}

      {canManage && (
        <DishForm
          key={editing?.id ?? 'new-dish'}
          busy={loadState === 'loading'}
          editing={editing}
          onSubmit={handleCreateOrUpdate}
          onCancelEdit={() => setEditing(null)}
        />
      )}

      <DayTabs day={day} onChange={setDay} />
      <MenuFilters
        kind={kind}
        allergen={allergen}
        onKindChange={setKind}
        onAllergenChange={setAllergen}
      />

      <aside
        className="rounded-2xl border border-[var(--mb-line)] bg-white/90 px-4 py-3 text-sm"
        data-testid="pick-summary"
      >
        В выборе: <strong>{picked.length}</strong> ·{' '}
        <strong>{totals.price} ₽</strong> · <strong>{totals.calories} ккал</strong>
      </aside>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--mb-line)] bg-white/70 p-8 text-center text-slate-600">
          На этот день с текущими фильтрами блюд нет.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              picked={picked.includes(dish.id)}
              busy={loadState === 'loading'}
              canManage={canManage}
              onToggle={handleToggle}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <footer className="mt-auto border-t border-[var(--mb-line)] pt-4 text-xs text-slate-500">
        ДЗ5 · Суханова Ксения Львовна · React + Vite + Tailwind + Supabase
        {mode === 'demo' ? ' · demo без .env' : ' · live API'}
      </footer>
    </div>
  )
}
