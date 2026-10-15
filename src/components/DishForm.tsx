import { useState } from 'react'
import { KIND_LABEL, type Dish, type DishKind } from '../data/menu'
import type { DishInput } from '../types/menu'

type Props = {
  busy: boolean
  editing: Dish | null
  onSubmit: (input: DishInput) => Promise<void>
  onCancelEdit: () => void
}

const EMPTY: DishInput = {
  title: '',
  kind: 'main',
  calories: 300,
  protein: 20,
  fat: 10,
  carbs: 30,
  allergens: [],
}

export function DishForm({ busy, editing, onSubmit, onCancelEdit }: Props) {
  const [title, setTitle] = useState(editing?.title ?? EMPTY.title)
  const [kind, setKind] = useState<DishKind>(editing?.kind ?? EMPTY.kind)
  const [calories, setCalories] = useState(editing?.calories ?? EMPTY.calories)
  const [protein, setProtein] = useState(editing?.protein ?? EMPTY.protein)
  const [fat, setFat] = useState(editing?.fat ?? EMPTY.fat)
  const [carbs, setCarbs] = useState(editing?.carbs ?? EMPTY.carbs)
  const [allergensText, setAllergensText] = useState(
    (editing?.allergens ?? []).join(', '),
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      id: editing?.id,
      title,
      kind,
      calories: Number(calories),
      protein: Number(protein),
      fat: Number(fat),
      carbs: Number(carbs),
      allergens: allergensText
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    })
    if (!editing) {
      setTitle('')
      setAllergensText('')
      setCalories(300)
      setProtein(20)
      setFat(10)
      setCarbs(30)
    }
  }

  return (
    <form
      className="grid gap-3 rounded-2xl border border-[var(--mb-line)] bg-white/90 p-4 sm:grid-cols-2"
      data-testid="dish-form"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-[var(--mb-forest)]">
        {editing ? `Редактирование: ${editing.title}` : 'Каталог — добавить блюдо'}
      </h2>
      <p className="sm:col-span-2 -mt-1 text-xs text-slate-500">
        Блюдо добавляется в общий каталог и доступно на любую дату плана.
      </p>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="font-semibold">Название</span>
        <input
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={busy}
          aria-label="Название блюда"
          data-testid="dish-title-input"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Тип / категория</span>
        <select
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={kind}
          onChange={(e) => setKind(e.target.value as DishKind)}
          disabled={busy}
          aria-label="Тип нового блюда"
        >
          {(Object.keys(KIND_LABEL) as DishKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Ккал</span>
        <input
          type="number"
          min={0}
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={calories}
          onChange={(e) => setCalories(Number(e.target.value))}
          disabled={busy}
          aria-label="Калории"
          data-testid="dish-calories-input"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Белки, г</span>
        <input
          type="number"
          min={0}
          step={0.1}
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={protein}
          onChange={(e) => setProtein(Number(e.target.value))}
          disabled={busy}
          aria-label="Белки"
          data-testid="dish-protein-input"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Жиры, г</span>
        <input
          type="number"
          min={0}
          step={0.1}
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={fat}
          onChange={(e) => setFat(Number(e.target.value))}
          disabled={busy}
          aria-label="Жиры"
          data-testid="dish-fat-input"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Углеводы, г</span>
        <input
          type="number"
          min={0}
          step={0.1}
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={carbs}
          onChange={(e) => setCarbs(Number(e.target.value))}
          disabled={busy}
          aria-label="Углеводы"
          data-testid="dish-carbs-input"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="font-semibold">Аллергены (через запятую)</span>
        <input
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={allergensText}
          onChange={(e) => setAllergensText(e.target.value)}
          disabled={busy}
          placeholder="молоко, глютен"
          aria-label="Аллергены"
        />
      </label>

      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button
          type="submit"
          className="rounded-xl bg-[var(--mb-forest)] px-4 py-2 text-sm font-semibold text-[var(--mb-cream)] disabled:opacity-50"
          disabled={busy}
          data-testid="dish-form-submit"
        >
          {editing ? 'Сохранить (Update)' : 'Создать (Create)'}
        </button>
        {editing && (
          <button
            type="button"
            className="rounded-xl border border-[var(--mb-line)] px-4 py-2 text-sm"
            onClick={onCancelEdit}
            disabled={busy}
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  )
}
