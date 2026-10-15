import type { Dish, DishKind, Weekday } from '../data/menu'

export function dishesForDay(menu: Dish[], day: Weekday): Dish[] {
  return menu.filter((dish) => dish.day === day)
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

export function togglePick(picked: string[], dishId: string): string[] {
  return picked.includes(dishId)
    ? picked.filter((id) => id !== dishId)
    : [...picked, dishId]
}

export function sumPicked(menu: Dish[], picked: string[]) {
  return menu
    .filter((dish) => picked.includes(dish.id))
    .reduce(
      (acc, dish) => {
        acc.price += dish.priceRub
        acc.calories += dish.calories
        return acc
      },
      { price: 0, calories: 0 },
    )
}
