import { WEEKDAYS, type Weekday } from '../data/menu'

type Props = {
  day: Weekday
  onChange: (day: Weekday) => void
}

export function DayTabs({ day, onChange }: Props) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Дни недели">
      {WEEKDAYS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`min-w-14 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            day === item.id
              ? 'border-[var(--mb-forest)] bg-[var(--mb-forest)] text-[var(--mb-cream)]'
              : 'border-[var(--mb-line)] bg-white text-[var(--mb-forest)]'
          }`}
          onClick={() => onChange(item.id)}
          aria-pressed={day === item.id}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
