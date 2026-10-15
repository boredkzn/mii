import type { Dish, DishKind, MealSlot, PlanEntry } from '../data/menu'

export type DishRow = {
  id: string
  title: string
  kind: DishKind
  calories: number
  protein: number
  fat: number
  carbs: number
  allergens: string[] | null
}

export type PlanEntryRow = {
  id: string
  dish_id: string
  user_id: string
  plan_date: string
  meal_slot: MealSlot | null
  created_at: string
}

export type DishInput = {
  id?: string
  title: string
  kind: DishKind
  calories: number
  protein: number
  fat: number
  carbs: number
  allergens: string[]
}

export function rowToDish(row: DishRow): Dish {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    calories: row.calories,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    allergens: row.allergens ?? [],
  }
}

export function dishToRow(dish: Dish): DishRow {
  return {
    id: dish.id,
    title: dish.title,
    kind: dish.kind,
    calories: dish.calories,
    protein: dish.protein,
    fat: dish.fat,
    carbs: dish.carbs,
    allergens: dish.allergens,
  }
}

export function rowToPlanEntry(row: PlanEntryRow): PlanEntry {
  return {
    id: row.id,
    dishId: row.dish_id,
    planDate: row.plan_date,
    mealSlot: row.meal_slot,
  }
}
