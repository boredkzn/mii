import { describe, expect, it } from 'vitest'
import { MENU } from '../data/menu'
import { dishesForDay, filterDishes, sumPicked, togglePick } from './menuLogic'

describe('dishesForDay', () => {
  it('возвращает блюда только выбранного дня', () => {
    const mon = dishesForDay(MENU, 'mon')
    expect(mon.every((d) => d.day === 'mon')).toBe(true)
    expect(mon.length).toBeGreaterThanOrEqual(3)
  })
})

describe('filterDishes', () => {
  it('фильтрует по типу и скрывает аллерген', () => {
    const soups = filterDishes(MENU, 'soup', '')
    expect(soups.every((d) => d.kind === 'soup')).toBe(true)

    const noMilk = filterDishes(MENU, 'all', 'молоко')
    expect(noMilk.every((d) => !d.allergens.includes('молоко'))).toBe(true)
  })
})

describe('togglePick и sumPicked', () => {
  it('добавляет и убирает блюдо из выбора', () => {
    const once = togglePick([], 'd-mon-soup')
    expect(once).toEqual(['d-mon-soup'])
    expect(togglePick(once, 'd-mon-soup')).toEqual([])
  })

  it('суммирует цену и калории выбранных блюд', () => {
    const totals = sumPicked(MENU, ['d-mon-soup', 'd-tue-drink'])
    expect(totals.price).toBe(170)
    expect(totals.calories).toBe(410)
  })
})
