import { KIND_LABEL, type DishKind } from '../data/menu'

type Props = {
  kind: 'all' | DishKind
  allergen: string
  onKindChange: (kind: 'all' | DishKind) => void
  onAllergenChange: (value: string) => void
}

export function MenuFilters({ kind, allergen, onKindChange, onAllergenChange }: Props) {
  return (
    <section className="grid gap-3 rounded-2xl border border-[var(--mb-line)] bg-white/80 p-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-[var(--mb-forest)]">Тип блюда</span>
        <select
          className="rounded-xl border border-[var(--mb-line)] bg-white px-3 py-2"
          value={kind}
          onChange={(e) => onKindChange(e.target.value as 'all' | DishKind)}
          aria-label="Тип блюда"
        >
          <option value="all">Все</option>
          {(Object.keys(KIND_LABEL) as DishKind[]).map((key) => (
            <option key={key} value={key}>
              {KIND_LABEL[key]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-[var(--mb-forest)]">Скрыть аллерген</span>
        <input
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          placeholder="например: молоко"
          value={allergen}
          onChange={(e) => onAllergenChange(e.target.value)}
          aria-label="Скрыть аллерген"
        />
      </label>
    </section>
  )
}
