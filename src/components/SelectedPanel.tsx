import { formatPlanDate, MEAL_SLOT_LABEL, type Dish, type PlanEntry } from '../data/menu'
import {
  groupPlanByDate,
  resolvePlanDishes,
  sumPlanMacros,
  type MacroTotals,
} from '../utils/menuLogic'

type Props = {
  catalog: Dish[]
  plan: PlanEntry[]
  selectedDate: string
  mode: 'selected-day' | 'all-dates'
  busy: boolean
  onRemove: (entryId: string) => void
  onModeChange: (mode: 'selected-day' | 'all-dates') => void
}

function TotalsLine({ totals }: { totals: MacroTotals }) {
  return (
    <p className="text-sm text-slate-700" data-testid="kbju-totals">
      <strong>{totals.calories}</strong> ккал · Б{' '}
      <strong>{totals.protein}</strong> · Ж <strong>{totals.fat}</strong> · У{' '}
      <strong>{totals.carbs}</strong>
    </p>
  )
}

export function SelectedPanel({
  catalog,
  plan,
  selectedDate,
  mode,
  busy,
  onRemove,
  onModeChange,
}: Props) {
  const dayEntries = plan.filter((e) => e.planDate === selectedDate)
  const dayItems = resolvePlanDishes(catalog, dayEntries)
  const dayTotals = sumPlanMacros(catalog, plan, selectedDate)
  const grouped = groupPlanByDate(catalog, plan)

  return (
    <aside
      className="rounded-2xl border border-[var(--mb-line)] bg-white/95 p-4 shadow-sm"
      data-testid="selected-panel"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--mb-forest)]">
            Выбранные позиции
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Блюда плана и сумма КБЖУ (калории, белки, жиры, углеводы)
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            className={`rounded-lg border px-3 py-1.5 font-semibold ${
              mode === 'selected-day'
                ? 'border-[var(--mb-forest)] bg-[var(--mb-forest)] text-[var(--mb-cream)]'
                : 'border-[var(--mb-line)] bg-white text-[var(--mb-forest)]'
            }`}
            onClick={() => onModeChange('selected-day')}
            data-testid="panel-mode-day"
          >
            Выбранная дата
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-1.5 font-semibold ${
              mode === 'all-dates'
                ? 'border-[var(--mb-forest)] bg-[var(--mb-forest)] text-[var(--mb-cream)]'
                : 'border-[var(--mb-line)] bg-white text-[var(--mb-forest)]'
            }`}
            onClick={() => onModeChange('all-dates')}
            data-testid="panel-mode-all"
          >
            Все даты
          </button>
        </div>
      </div>

      {mode === 'selected-day' ? (
        <div className="mt-4 space-y-3" data-testid="selected-day-list">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold text-[var(--mb-forest)]">
              {formatPlanDate(selectedDate)}
            </p>
            <TotalsLine totals={dayTotals} />
          </div>
          {dayItems.length === 0 ? (
            <p className="text-sm text-slate-500">На эту дату пока ничего не выбрано.</p>
          ) : (
            <ul className="space-y-2">
              {dayItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--mb-line)] bg-[#fffaf4] px-3 py-2"
                  data-testid={`plan-item-${item.id}`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--mb-forest)]">
                      {item.dish.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.dish.calories} ккал · Б{item.dish.protein} Ж{item.dish.fat} У
                      {item.dish.carbs}
                      {item.mealSlot ? ` · ${MEAL_SLOT_LABEL[item.mealSlot]}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-800 disabled:opacity-50"
                    onClick={() => onRemove(item.id)}
                    disabled={busy}
                    data-testid={`remove-plan-${item.id}`}
                  >
                    Убрать
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4" data-testid="all-dates-list">
          {grouped.length === 0 ? (
            <p className="text-sm text-slate-500">План пуст — добавьте блюда из каталога.</p>
          ) : (
            grouped.map((group) => (
              <div key={group.date} className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-[var(--mb-forest)]">
                    {formatPlanDate(group.date)}
                  </p>
                  <TotalsLine totals={group.totals} />
                </div>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--mb-line)] px-3 py-2"
                    >
                      <span className="truncate text-sm">{item.dish.title}</span>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-800 disabled:opacity-50"
                        onClick={() => onRemove(item.id)}
                        disabled={busy}
                      >
                        Убрать
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  )
}
