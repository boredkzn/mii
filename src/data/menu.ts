export type DishKind = 'soup' | 'main' | 'salad' | 'drink' | 'snack'

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

/** Блюдо каталога — без привязки к дню и без цены. */
export type Dish = {
  id: string
  title: string
  kind: DishKind
  calories: number
  protein: number
  fat: number
  carbs: number
  allergens: string[]
}

/** Запись плана питания на конкретную дату. */
export type PlanEntry = {
  id: string
  dishId: string
  planDate: string // YYYY-MM-DD
  mealSlot: MealSlot | null
}

export const KIND_LABEL: Record<DishKind, string> = {
  soup: 'Суп',
  main: 'Горячее',
  salad: 'Салат',
  drink: 'Напиток',
  snack: 'Перекус',
}

export const MEAL_SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
}

/** Seed каталога блюд (единый, доступен на любую дату). */
export const MENU: Dish[] = [
  {
    id: 'd-borscht',
    title: 'Борщ со сметаной',
    kind: 'soup',
    calories: 320,
    protein: 12,
    fat: 14,
    carbs: 32,
    allergens: ['молоко'],
  },
  {
    id: 'd-chicken-cutlet',
    title: 'Котлета куриная с гречкой',
    kind: 'main',
    calories: 540,
    protein: 38,
    fat: 22,
    carbs: 48,
    allergens: ['глютен'],
  },
  {
    id: 'd-vinaigrette',
    title: 'Винегрет',
    kind: 'salad',
    calories: 180,
    protein: 4,
    fat: 8,
    carbs: 22,
    allergens: [],
  },
  {
    id: 'd-chicken-noodle',
    title: 'Куриный суп с лапшой',
    kind: 'soup',
    calories: 280,
    protein: 18,
    fat: 8,
    carbs: 28,
    allergens: ['глютен', 'яйцо'],
  },
  {
    id: 'd-baked-fish',
    title: 'Рыба запечённая с овощами',
    kind: 'main',
    calories: 410,
    protein: 36,
    fat: 18,
    carbs: 20,
    allergens: ['рыба'],
  },
  {
    id: 'd-compote',
    title: 'Компот из сухофруктов',
    kind: 'drink',
    calories: 90,
    protein: 0,
    fat: 0,
    carbs: 22,
    allergens: [],
  },
  {
    id: 'd-plov',
    title: 'Плов с говядиной',
    kind: 'main',
    calories: 620,
    protein: 28,
    fat: 24,
    carbs: 72,
    allergens: [],
  },
  {
    id: 'd-caesar',
    title: 'Цезарь с курицей',
    kind: 'salad',
    calories: 350,
    protein: 26,
    fat: 20,
    carbs: 14,
    allergens: ['молоко', 'глютен', 'яйцо'],
  },
  {
    id: 'd-mushroom-soup',
    title: 'Грибной крем-суп',
    kind: 'soup',
    calories: 260,
    protein: 8,
    fat: 16,
    carbs: 18,
    allergens: ['молоко'],
  },
  {
    id: 'd-turkey-quinoa',
    title: 'Индейка с киноа',
    kind: 'main',
    calories: 480,
    protein: 42,
    fat: 14,
    carbs: 40,
    allergens: [],
  },
  {
    id: 'd-carbonara',
    title: 'Паста карбонара',
    kind: 'main',
    calories: 590,
    protein: 24,
    fat: 28,
    carbs: 58,
    allergens: ['глютен', 'молоко', 'яйцо'],
  },
  {
    id: 'd-cranberry',
    title: 'Морс клюквенный',
    kind: 'drink',
    calories: 70,
    protein: 0,
    fat: 0,
    carbs: 17,
    allergens: [],
  },
]

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatPlanDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
}
