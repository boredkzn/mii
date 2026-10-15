export type DishKind = 'soup' | 'main' | 'salad' | 'drink'

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export type Dish = {
  id: string
  title: string
  kind: DishKind
  day: Weekday
  calories: number
  allergens: string[]
  priceRub: number
}

export const WEEKDAYS: { id: Weekday; label: string }[] = [
  { id: 'mon', label: 'Пн' },
  { id: 'tue', label: 'Вт' },
  { id: 'wed', label: 'Ср' },
  { id: 'thu', label: 'Чт' },
  { id: 'fri', label: 'Пт' },
]

export const KIND_LABEL: Record<DishKind, string> = {
  soup: 'Суп',
  main: 'Горячее',
  salad: 'Салат',
  drink: 'Напиток',
}

export const MENU: Dish[] = [
  {
    id: 'd-mon-soup',
    title: 'Борщ со сметаной',
    kind: 'soup',
    day: 'mon',
    calories: 320,
    allergens: ['молоко'],
    priceRub: 120,
  },
  {
    id: 'd-mon-main',
    title: 'Котлета куриная с гречкой',
    kind: 'main',
    day: 'mon',
    calories: 540,
    allergens: ['глютен'],
    priceRub: 210,
  },
  {
    id: 'd-mon-salad',
    title: 'Винегрет',
    kind: 'salad',
    day: 'mon',
    calories: 180,
    allergens: [],
    priceRub: 90,
  },
  {
    id: 'd-tue-soup',
    title: 'Куриный суп с лапшой',
    kind: 'soup',
    day: 'tue',
    calories: 280,
    allergens: ['глютен', 'яйцо'],
    priceRub: 110,
  },
  {
    id: 'd-tue-main',
    title: 'Рыба запечённая с овощами',
    kind: 'main',
    day: 'tue',
    calories: 410,
    allergens: ['рыба'],
    priceRub: 240,
  },
  {
    id: 'd-tue-drink',
    title: 'Компот из сухофруктов',
    kind: 'drink',
    day: 'tue',
    calories: 90,
    allergens: [],
    priceRub: 50,
  },
  {
    id: 'd-wed-main',
    title: 'Плов с говядиной',
    kind: 'main',
    day: 'wed',
    calories: 620,
    allergens: [],
    priceRub: 230,
  },
  {
    id: 'd-wed-salad',
    title: 'Цезарь с курицей',
    kind: 'salad',
    day: 'wed',
    calories: 350,
    allergens: ['молоко', 'глютен', 'яйцо'],
    priceRub: 180,
  },
  {
    id: 'd-thu-soup',
    title: 'Грибной крем-суп',
    kind: 'soup',
    day: 'thu',
    calories: 260,
    allergens: ['молоко'],
    priceRub: 130,
  },
  {
    id: 'd-thu-main',
    title: 'Индейка с киноа',
    kind: 'main',
    day: 'thu',
    calories: 480,
    allergens: [],
    priceRub: 250,
  },
  {
    id: 'd-fri-main',
    title: 'Паста карбонара',
    kind: 'main',
    day: 'fri',
    calories: 590,
    allergens: ['глютен', 'молоко', 'яйцо'],
    priceRub: 220,
  },
  {
    id: 'd-fri-drink',
    title: 'Морс клюквенный',
    kind: 'drink',
    day: 'fri',
    calories: 70,
    allergens: [],
    priceRub: 55,
  },
]
