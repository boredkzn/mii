import type { Dish, DishKind, Weekday } from '../data/menu'

export type DishRow = {
  id: string
  title: string
  kind: DishKind
  day: Weekday
  calories: number
  allergens: string[] | null
  price_rub: number
}

export type MenuPickRow = {
  id: string
  dish_id: string
  user_id: string
  created_at: string
}

export type DishInput = {
  id?: string
  title: string
  kind: DishKind
  day: Weekday
  calories: number
  allergens: string[]
  priceRub: number
}

export function rowToDish(row: DishRow): Dish {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    day: row.day,
    calories: row.calories,
    allergens: row.allergens ?? [],
    priceRub: row.price_rub,
  }
}

export function dishToRow(dish: Dish): Omit<DishRow, never> {
  return {
    id: dish.id,
    title: dish.title,
    kind: dish.kind,
    day: dish.day,
    calories: dish.calories,
    allergens: dish.allergens,
    price_rub: dish.priceRub,
  }
}
