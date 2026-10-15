import { formatPlanDate } from '../data/menu'

type Props = {
  date: string
  onChange: (date: string) => void
}

export function DatePicker({ date, onChange }: Props) {
  return (
    <section
      className="flex flex-col gap-2 rounded-2xl border border-[var(--mb-line)] bg-white/90 p-4 sm:flex-row sm:items-end sm:justify-between"
      data-testid="date-picker"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mb-leaf)]">
          Календарь плана
        </p>
        <p className="mt-1 text-lg font-semibold text-[var(--mb-forest)]" data-testid="selected-date-label">
          {formatPlanDate(date)}
        </p>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-[var(--mb-forest)]">Дата</span>
        <input
          type="date"
          className="rounded-xl border border-[var(--mb-line)] px-3 py-2"
          value={date}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Дата плана питания"
          data-testid="plan-date-input"
        />
      </label>
    </section>
  )
}
