import type { Dish, DishKind, PlanEntry } from '../data/menu'

export type MacroTotals = {
  calories: number
  protein: number
  fat: number
  carbs: number
}

export function filterDishes(
  dishes: Dish[],
  kind: 'all' | DishKind,
  hideAllergen: string,
): Dish[] {
  const allergen = hideAllergen.trim().toLowerCase()
  return dishes.filter((dish) => {
    if (kind !== 'all' && dish.kind !== kind) return false
    if (!allergen) return true
    return !dish.allergens.some((a) => a.toLowerCase() === allergen)
  })
}

export function planEntriesForDate(entries: PlanEntry[], planDate: string): PlanEntry[] {
  return entries.filter((e) => e.planDate === planDate)
}

export function dishIdsForDate(entries: PlanEntry[], planDate: string): string[] {
  return planEntriesForDate(entries, planDate).map((e) => e.dishId)
}

export function isDishPlannedOnDate(
  entries: PlanEntry[],
  dishId: string,
  planDate: string,
): boolean {
  return entries.some((e) => e.dishId === dishId && e.planDate === planDate)
}

export function sumMacros(dishes: Dish[]): MacroTotals {
  return dishes.reduce(
    (acc, dish) => {
      acc.calories += dish.calories
      acc.protein += dish.protein
      acc.fat += dish.fat
      acc.carbs += dish.carbs
      return acc
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  )
}

export function sumPlanMacros(
  catalog: Dish[],
  entries: PlanEntry[],
  planDate?: string,
): MacroTotals {
  const scoped = planDate ? planEntriesForDate(entries, planDate) : entries
  const dishes = scoped
    .map((e) => catalog.find((d) => d.id === e.dishId))
    .filter((d): d is Dish => Boolean(d))
  return sumMacros(dishes)
}

export function resolvePlanDishes(
  catalog: Dish[],
  entries: PlanEntry[],
): Array<PlanEntry & { dish: Dish }> {
  return entries
    .map((e) => {
      const dish = catalog.find((d) => d.id === e.dishId)
      return dish ? { ...e, dish } : null
    })
    .filter((x): x is PlanEntry & { dish: Dish } => Boolean(x))
}

export function groupPlanByDate(
  catalog: Dish[],
  entries: PlanEntry[],
): Array<{ date: string; items: Array<PlanEntry & { dish: Dish }>; totals: MacroTotals }> {
  const dates = [...new Set(entries.map((e) => e.planDate))].sort()
  return dates.map((date) => {
    const items = resolvePlanDishes(catalog, planEntriesForDate(entries, date))
    return { date, items, totals: sumMacros(items.map((i) => i.dish)) }
  })
}
