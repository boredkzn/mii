import { describe, expect, it } from 'vitest'
import { MENU } from '../data/menu'
import type { PlanEntry } from '../data/menu'
import {
  filterDishes,
  isDishPlannedOnDate,
  planEntriesForDate,
  sumMacros,
  sumPlanMacros,
} from './menuLogic'

const samplePlan: PlanEntry[] = [
  { id: 'p1', dishId: 'd-borscht', planDate: '2026-10-15', mealSlot: 'lunch' },
  { id: 'p2', dishId: 'd-compote', planDate: '2026-10-15', mealSlot: null },
  { id: 'p3', dishId: 'd-plov', planDate: '2026-10-16', mealSlot: 'dinner' },
]

describe('filterDishes', () => {
  it('фильтрует по типу и скрывает аллерген', () => {
    const soups = filterDishes(MENU, 'soup', '')
    expect(soups.every((d) => d.kind === 'soup')).toBe(true)

    const noMilk = filterDishes(MENU, 'all', 'молоко')
    expect(noMilk.every((d) => !d.allergens.includes('молоко'))).toBe(true)
  })
})

describe('plan by date', () => {
  it('выбирает записи на дату', () => {
    const day = planEntriesForDate(samplePlan, '2026-10-15')
    expect(day).toHaveLength(2)
    expect(isDishPlannedOnDate(samplePlan, 'd-borscht', '2026-10-15')).toBe(true)
    expect(isDishPlannedOnDate(samplePlan, 'd-borscht', '2026-10-16')).toBe(false)
  })
})

describe('sumMacros / sumPlanMacros', () => {
  it('суммирует КБЖУ блюд', () => {
    const borscht = MENU.find((d) => d.id === 'd-borscht')!
    const compote = MENU.find((d) => d.id === 'd-compote')!
    const totals = sumMacros([borscht, compote])
    expect(totals.calories).toBe(410)
    expect(totals.protein).toBe(12)
    expect(totals.fat).toBe(14)
    expect(totals.carbs).toBe(54)
  })

  it('суммирует КБЖУ плана на дату', () => {
    const totals = sumPlanMacros(MENU, samplePlan, '2026-10-15')
    expect(totals.calories).toBe(410)
    expect(totals.protein).toBe(12)
  })
})
