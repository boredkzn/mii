import { KIND_LABEL, type Dish } from '../data/menu'

type Props = {
  dish: Dish
  picked: boolean
  busy: boolean
  canManage: boolean
  onToggle: (id: string) => void
  onEdit: (dish: Dish) => void
  onDelete: (id: string) => void
}

export function DishCard({
  dish,
  picked,
  busy,
  canManage,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl border p-4 transition ${
        picked
          ? 'border-[var(--mb-clay)] bg-[#fff1e6]'
          : 'border-[var(--mb-line)] bg-white/90'
      }`}
      data-testid={`dish-${dish.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--mb-leaf)]">
            {KIND_LABEL[dish.kind]}
          </p>
          <h3 className="text-xl font-semibold text-[var(--mb-forest)]">{dish.title}</h3>
        </div>
        <p className="text-lg font-bold text-[var(--mb-clay)]">{dish.priceRub} ₽</p>
      </div>

      <p className="text-sm text-slate-600">{dish.calories} ккал</p>

      {dish.allergens.length > 0 ? (
        <p className="text-xs text-amber-800">
          Аллергены: {dish.allergens.join(', ')}
        </p>
      ) : (
        <p className="text-xs text-emerald-800">Без указанных аллергенов</p>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
            picked
              ? 'bg-[var(--mb-clay)] text-white'
              : 'bg-[var(--mb-forest)] text-[var(--mb-cream)]'
          }`}
          onClick={() => onToggle(dish.id)}
          disabled={busy}
        >
          {picked ? 'Убрать из выбора' : 'Возьму'}
        </button>
        {canManage && (
          <>
            <button
              type="button"
              className="rounded-xl border border-[var(--mb-line)] px-3 py-2 text-sm disabled:opacity-50"
              onClick={() => onEdit(dish)}
              disabled={busy}
              data-testid={`edit-${dish.id}`}
            >
              Изменить
            </button>
            <button
              type="button"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 disabled:opacity-50"
              onClick={() => onDelete(dish.id)}
              disabled={busy}
              data-testid={`delete-${dish.id}`}
            >
              Удалить
            </button>
          </>
        )}
      </div>
    </article>
  )
}
