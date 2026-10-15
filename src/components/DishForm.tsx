import { useState } from 'react'
import { KIND_LABEL, WEEKDAYS, type Dish, type DishKind, type Weekday } from '../data/menu'
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
  day: 'mon',
  calories: 300,
  allergens: [],
  priceRub: 150,
}

export function DishForm({ busy, editing, onSubmit, onCancelEdit }: Props) {
  const [title, setTitle] = useState(editing?.title ?? EMPTY.title)
  const [kind, setKind] = useState<DishKind>(editing?.kind ?? EMPTY.kind)
  const [day, setDay] = useState<Weekday>(editing?.day ?? EMPTY.day)
  const [calories, setCalories] = useState(editing?.calories ?? EMPTY.calories)
  const [priceRub, setPriceRub] = useState(editing?.priceRub ?? EMPTY.priceRub)
  const [allergensText, setAllergensText] = useState(
    (editing?.allergens ?? []).join(', '),
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      id: editing?.id,
      title,
      kind,
      day,
      calories: Number(calories),
      priceRub: Number(priceRub),
      allergens: allergensText
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    })
    if (!editing) {
      setTitle('')
      setAllergensText('')
      setCalories(300)
      setPriceRub(150)
    }
  }

  return (
    <form
      className="grid gap-3 rounded-2xl border border-[var(--mb-line)] bg-white/90 p-4 sm:grid-cols-2"
      data-testid="dish-form"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-[var(--mb-forest)]">
        {editing ? `Редактирование: ${editing.title}` : 'Добавить блюдо (Create)'}
      </h2>

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
        <span className="font-semibold">Тип</span>
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
        <span className="font-semibold">День</span>
        <select
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={day}
          onChange={(e) => setDay(e.target.value as Weekday)}
          disabled={busy}
          aria-label="День нового блюда"
        >
          {WEEKDAYS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
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
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Цена, ₽</span>
        <input
          type="number"
          min={0}
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={priceRub}
          onChange={(e) => setPriceRub(Number(e.target.value))}
          disabled={busy}
          aria-label="Цена"
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
