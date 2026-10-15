import { useEffect, useMemo, useState } from 'react'
import { getAuthSnapshot, onAuthChange, type AuthSnapshot } from './api/authApi'
import {
  createDishRemote,
  deleteDishRemote,
  fetchDishes,
  fetchPlanEntries,
  getDataMode,
  removeFromPlan,
  togglePlanRemote,
  updateDishRemote,
} from './api/menuApi'
import { AuthPanel } from './components/AuthPanel'
import { DatePicker } from './components/DatePicker'
import { DishCard } from './components/DishCard'
import { DishForm } from './components/DishForm'
import { MenuFilters } from './components/MenuFilters'
import { SelectedPanel } from './components/SelectedPanel'
import { MENU, todayISO, type Dish, type DishKind, type PlanEntry } from './data/menu'
import { toApiError } from './lib/apiErrors'
import type { DishInput } from './types/menu'
import { filterDishes, isDishPlannedOnDate, sumPlanMacros } from './utils/menuLogic'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const [catalog, setCatalog] = useState<Dish[]>(MENU)
  const [plan, setPlan] = useState<PlanEntry[]>([])
  const [planDate, setPlanDate] = useState(todayISO())
  const [panelMode, setPanelMode] = useState<'selected-day' | 'all-dates'>('selected-day')
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

  const visible = useMemo(
    () => filterDishes(catalog, kind, allergen),
    [catalog, kind, allergen],
  )
  const dayTotals = useMemo(
    () => sumPlanMacros(catalog, plan, planDate),
    [catalog, plan, planDate],
  )
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
        const [list, entries] = await Promise.all([fetchDishes(), fetchPlanEntries()])
        if (cancelled) return
        setCatalog(list)
        setPlan(entries)
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
    const [list, entries] = await Promise.all([fetchDishes(), fetchPlanEntries()])
    setCatalog(list)
    setPlan(entries)
  }

  async function handleTogglePlan(dishId: string) {
    if (needsAuth) {
      const msg = 'Требуется вход (401). Войдите или зарегистрируйтесь.'
      setLoadState('error')
      setBanner(msg)
      return
    }
    setLoadState('loading')
    setBanner(null)
    try {
      const next = await togglePlanRemote(dishId, planDate)
      setPlan(next)
      setLoadState('success')
      setBanner('План обновлён')
    } catch (err) {
      const apiErr = toApiError(err)
      setLoadState('error')
      setBanner(apiErr.message)
    }
  }

  async function handleRemovePlan(entryId: string) {
    if (needsAuth) {
      const msg = 'Требуется вход (401). Войдите или зарегистрируйтесь.'
      setLoadState('error')
      setBanner(msg)
      return
    }
    setLoadState('loading')
    setBanner(null)
    try {
      const next = await removeFromPlan(entryId)
      setPlan(next)
      setLoadState('success')
      setBanner('Позиция убрана из плана')
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
      setCatalog(next)
      setEditing(null)
      setLoadState('success')
      setBanner(editing ? 'Блюдо обновлено' : 'Блюдо добавлено в каталог')
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
      setCatalog(next)
      setPlan((prev) => prev.filter((e) => e.dishId !== dishId))
      if (editing?.id === dishId) setEditing(null)
      setLoadState('success')
      setBanner('Блюдо удалено из каталога')
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
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6">
      <header className="rounded-3xl border border-[var(--mb-line)] bg-[var(--mb-forest)] px-5 py-6 text-[var(--mb-cream)] shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b7d4c4]">
          Планировщик еды · Суханова
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">MenuBoard</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#d7ebe0] sm:text-base">
          Каталог блюд и план питания по календарю: КБЖУ, фильтры, CRUD и
          Supabase — или demo без ключей.
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
          Backend подключён. Для чтения/записи каталога и плана войдите (RLS требует{' '}
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

      <DatePicker date={planDate} onChange={setPlanDate} />

      <SelectedPanel
        catalog={catalog}
        plan={plan}
        selectedDate={planDate}
        mode={panelMode}
        busy={loadState === 'loading'}
        onRemove={handleRemovePlan}
        onModeChange={setPanelMode}
      />

      <aside
        className="rounded-2xl border border-[var(--mb-line)] bg-white/90 px-4 py-3 text-sm"
        data-testid="day-summary"
      >
        На выбранную дату в плане: <strong>{dayTotals.calories}</strong> ккал · Б{' '}
        <strong>{dayTotals.protein}</strong> · Ж <strong>{dayTotals.fat}</strong> · У{' '}
        <strong>{dayTotals.carbs}</strong>
      </aside>

      <MenuFilters
        kind={kind}
        allergen={allergen}
        onKindChange={setKind}
        onAllergenChange={setAllergen}
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--mb-forest)]">
          Каталог блюд
        </h2>
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--mb-line)] bg-white/70 p-8 text-center text-slate-600">
            В каталоге с текущими фильтрами блюд нет.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                planned={isDishPlannedOnDate(plan, dish.id, planDate)}
                busy={loadState === 'loading'}
                canManage={canManage}
                onTogglePlan={handleTogglePlan}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-auto border-t border-[var(--mb-line)] pt-4 text-xs text-slate-500">
        ДЗ5 · Суханова Ксения Львовна · планировщик еды · React + Vite + Tailwind +
        Supabase
        {mode === 'demo' ? ' · demo без .env' : ' · live API'}
      </footer>
    </div>
  )
}
