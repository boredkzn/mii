import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MENU } from '../data/menu'
import { ApiError } from '../lib/apiErrors'
import {
  addToPlan,
  createDishRemote,
  deleteDishRemote,
  fetchDishes,
  fetchPlanEntries,
  getDataMode,
  removeFromPlan,
  resetDemoMenu,
  togglePlanRemote,
  updateDishRemote,
} from './menuApi'

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabase: () => null,
}))

describe('menuApi (demo / без live Supabase)', () => {
  beforeEach(() => {
    resetDemoMenu(MENU, [])
  })

  it('работает в режиме demo', () => {
    expect(getDataMode()).toBe('demo')
  })

  it('fetchDishes возвращает seed каталога без day/price', async () => {
    const dishes = await fetchDishes()
    expect(dishes).toHaveLength(MENU.length)
    const borscht = dishes.find((d) => d.id === 'd-borscht')
    expect(borscht?.title).toMatch(/Борщ/)
    expect(borscht).not.toHaveProperty('priceRub')
    expect(borscht).not.toHaveProperty('day')
    expect(borscht?.protein).toBeGreaterThan(0)
  })

  it('createDishRemote добавляет блюдо в каталог', async () => {
    const next = await createDishRemote({
      title: 'Окрошка',
      kind: 'soup',
      calories: 200,
      protein: 8,
      fat: 6,
      carbs: 22,
      allergens: [],
    })
    expect(next.some((d) => d.title === 'Окрошка')).toBe(true)
  })

  it('createDishRemote валидирует пустое название', async () => {
    await expect(
      createDishRemote({
        title: '  ',
        kind: 'soup',
        calories: 10,
        protein: 0,
        fat: 0,
        carbs: 0,
        allergens: [],
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('updateDishRemote обновляет блюдо', async () => {
    const next = await updateDishRemote('d-borscht', {
      title: 'Борщ постный',
      kind: 'soup',
      calories: 280,
      protein: 10,
      fat: 8,
      carbs: 30,
      allergens: [],
    })
    expect(next.find((d) => d.id === 'd-borscht')?.title).toBe('Борщ постный')
  })

  it('deleteDishRemote удаляет блюдо', async () => {
    const next = await deleteDishRemote('d-cranberry')
    expect(next.find((d) => d.id === 'd-cranberry')).toBeUndefined()
  })

  it('deleteDishRemote ошибка если нет блюда', async () => {
    await expect(deleteDishRemote('missing')).rejects.toThrow('не найдено')
  })

  it('addToPlan / removeFromPlan работают по дате', async () => {
    let plan = await addToPlan('d-borscht', '2026-10-15')
    expect(plan.some((e) => e.dishId === 'd-borscht' && e.planDate === '2026-10-15')).toBe(
      true,
    )
    const entryId = plan[0].id
    plan = await removeFromPlan(entryId)
    expect(plan).toHaveLength(0)
    expect(await fetchPlanEntries()).toEqual([])
  })

  it('togglePlanRemote добавляет и убирает позицию на дату', async () => {
    let plan = await togglePlanRemote('d-borscht', '2026-10-15')
    expect(plan.some((e) => e.dishId === 'd-borscht')).toBe(true)
    plan = await togglePlanRemote('d-borscht', '2026-10-15')
    expect(plan.some((e) => e.dishId === 'd-borscht')).toBe(false)
  })
})

describe('menuApi с мок-клиентом Supabase', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('fetchDishes читает из from().select()', async () => {
    const rows = [
      {
        id: 'd-borscht',
        title: 'Борщ',
        kind: 'soup' as const,
        calories: 320,
        protein: 12,
        fat: 14,
        carbs: 32,
        allergens: ['молоко'],
      },
    ]

    const order2 = vi.fn().mockResolvedValue({ data: rows, error: null })
    const order1 = vi.fn().mockReturnValue({ order: order2 })
    const select = vi.fn().mockReturnValue({ order: order1 })
    const from = vi.fn().mockReturnValue({ select })

    vi.doMock('../lib/supabase', () => ({
      isSupabaseConfigured: () => true,
      getSupabase: () => ({ from }),
    }))

    const mod = await import('./menuApi')
    const dishes = await mod.fetchDishes()
    expect(from).toHaveBeenCalledWith('dishes')
    expect(dishes[0].protein).toBe(12)
    expect(dishes[0].id).toBe('d-borscht')
  })

  it('пробрасывает ошибку PostgREST как ApiError 403', async () => {
    const order2 = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'permission denied for table dishes', status: 403, code: '42501' },
    })
    const order1 = vi.fn().mockReturnValue({ order: order2 })
    const select = vi.fn().mockReturnValue({ order: order1 })
    const from = vi.fn().mockReturnValue({ select })

    vi.doMock('../lib/supabase', () => ({
      isSupabaseConfigured: () => true,
      getSupabase: () => ({ from }),
    }))

    const mod = await import('./menuApi')
    await expect(mod.fetchDishes()).rejects.toMatchObject({
      code: 'forbidden',
      status: 403,
    })
  })
})
