import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MENU } from '../data/menu'
import { ApiError } from '../lib/apiErrors'
import {
  createDishRemote,
  deleteDishRemote,
  fetchDishes,
  fetchPicks,
  getDataMode,
  resetDemoMenu,
  togglePickRemote,
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

  it('fetchDishes возвращает seed', async () => {
    const dishes = await fetchDishes()
    expect(dishes).toHaveLength(MENU.length)
    expect(dishes.find((d) => d.id === 'd-mon-soup')?.title).toMatch(/Борщ/)
  })

  it('createDishRemote добавляет блюдо', async () => {
    const next = await createDishRemote({
      title: 'Окрошка',
      kind: 'soup',
      day: 'fri',
      calories: 200,
      allergens: [],
      priceRub: 100,
    })
    expect(next.some((d) => d.title === 'Окрошка')).toBe(true)
  })

  it('createDishRemote валидирует пустое название', async () => {
    await expect(
      createDishRemote({
        title: '  ',
        kind: 'soup',
        day: 'mon',
        calories: 10,
        allergens: [],
        priceRub: 10,
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('updateDishRemote обновляет блюдо', async () => {
    const next = await updateDishRemote('d-mon-soup', {
      title: 'Борщ постный',
      kind: 'soup',
      day: 'mon',
      calories: 280,
      allergens: [],
      priceRub: 110,
    })
    expect(next.find((d) => d.id === 'd-mon-soup')?.title).toBe('Борщ постный')
  })

  it('deleteDishRemote удаляет блюдо', async () => {
    const next = await deleteDishRemote('d-fri-drink')
    expect(next.find((d) => d.id === 'd-fri-drink')).toBeUndefined()
  })

  it('deleteDishRemote ошибка если нет блюда', async () => {
    await expect(deleteDishRemote('missing')).rejects.toThrow('не найдено')
  })

  it('togglePickRemote добавляет и убирает выбор', async () => {
    let picks = await togglePickRemote('d-mon-soup')
    expect(picks).toContain('d-mon-soup')
    picks = await togglePickRemote('d-mon-soup')
    expect(picks).not.toContain('d-mon-soup')
    expect(await fetchPicks()).toEqual(picks)
  })
})

describe('menuApi с мок-клиентом Supabase', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('fetchDishes читает из from().select()', async () => {
    const rows = [
      {
        id: 'd-mon-soup',
        title: 'Борщ',
        kind: 'soup' as const,
        day: 'mon' as const,
        calories: 320,
        allergens: ['молоко'],
        price_rub: 120,
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
    expect(dishes[0].priceRub).toBe(120)
    expect(dishes[0].id).toBe('d-mon-soup')
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
