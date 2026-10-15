import { MENU, type Dish } from '../data/menu'
import { toApiError, ApiError } from '../lib/apiErrors'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { dishToRow, rowToDish, type DishInput, type DishRow } from '../types/menu'
import { togglePick } from '../utils/menuLogic'

/** In-memory demo store (когда нет VITE_SUPABASE_*). */
let demoMenu: Dish[] = MENU.map((d) => ({ ...d, allergens: [...d.allergens] }))
let demoPicked: string[] = []

export function resetDemoMenu(seed: Dish[] = MENU, picked: string[] = []) {
  demoMenu = seed.map((d) => ({ ...d, allergens: [...d.allergens] }))
  demoPicked = [...picked]
}

export function getDataMode(): 'supabase' | 'demo' {
  return isSupabaseConfigured() ? 'supabase' : 'demo'
}

function makeId(day: string, kind: string): string {
  return `d-${day}-${kind}-${Date.now().toString(36)}`
}

export async function fetchDishes(): Promise<Dish[]> {
  const supabase = getSupabase()
  if (!supabase) {
    return demoMenu.map((d) => ({ ...d, allergens: [...d.allergens] }))
  }

  const { data, error } = await supabase
    .from('dishes')
    .select('id, title, kind, day, calories, allergens, price_rub')
    .order('day', { ascending: true })
    .order('kind', { ascending: true })

  if (error) throw toApiError(error)
  return ((data ?? []) as DishRow[]).map(rowToDish)
}

export async function fetchPicks(): Promise<string[]> {
  const supabase = getSupabase()
  if (!supabase) {
    return [...demoPicked]
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('menu_picks')
    .select('dish_id')
    .eq('user_id', user.id)

  if (error) throw toApiError(error)
  return (data ?? []).map((row: { dish_id: string }) => row.dish_id)
}

export async function createDishRemote(input: DishInput): Promise<Dish[]> {
  const title = input.title.trim()
  if (!title) {
    throw new ApiError('Укажите название блюда', 400, 'validation')
  }
  if (input.calories < 0 || input.priceRub < 0) {
    throw new ApiError('Калории и цена не могут быть отрицательными', 400, 'validation')
  }

  const dish: Dish = {
    id: input.id?.trim() || makeId(input.day, input.kind),
    title,
    kind: input.kind,
    day: input.day,
    calories: input.calories,
    allergens: input.allergens.map((a) => a.trim()).filter(Boolean),
    priceRub: input.priceRub,
  }

  const supabase = getSupabase()
  if (!supabase) {
    if (demoMenu.some((d) => d.id === dish.id)) {
      throw new ApiError('Блюдо с таким id уже есть', 400, 'validation')
    }
    demoMenu = [...demoMenu, dish]
    return demoMenu.map((d) => ({ ...d, allergens: [...d.allergens] }))
  }

  const { error } = await supabase.from('dishes').insert(dishToRow(dish))
  if (error) throw toApiError(error)
  return fetchDishes()
}

export async function updateDishRemote(dishId: string, input: DishInput): Promise<Dish[]> {
  const title = input.title.trim()
  if (!title) {
    throw new ApiError('Укажите название блюда', 400, 'validation')
  }

  const patch = {
    title,
    kind: input.kind,
    day: input.day,
    calories: input.calories,
    allergens: input.allergens.map((a) => a.trim()).filter(Boolean),
    price_rub: input.priceRub,
  }

  const supabase = getSupabase()
  if (!supabase) {
    const idx = demoMenu.findIndex((d) => d.id === dishId)
    if (idx < 0) throw new ApiError('Блюдо не найдено', 404, 'unknown')
    demoMenu = demoMenu.map((d) =>
      d.id === dishId
        ? {
            ...d,
            title: patch.title,
            kind: patch.kind,
            day: patch.day,
            calories: patch.calories,
            allergens: [...patch.allergens],
            priceRub: patch.price_rub,
          }
        : d,
    )
    return demoMenu.map((d) => ({ ...d, allergens: [...d.allergens] }))
  }

  const { data, error } = await supabase
    .from('dishes')
    .update(patch)
    .eq('id', dishId)
    .select('id')
    .maybeSingle()

  if (error) throw toApiError(error)
  if (!data) throw new ApiError('Блюдо не найдено', 404, 'unknown')
  return fetchDishes()
}

export async function deleteDishRemote(dishId: string): Promise<Dish[]> {
  const supabase = getSupabase()
  if (!supabase) {
    if (!demoMenu.some((d) => d.id === dishId)) {
      throw new ApiError('Блюдо не найдено', 404, 'unknown')
    }
    demoMenu = demoMenu.filter((d) => d.id !== dishId)
    demoPicked = demoPicked.filter((id) => id !== dishId)
    return demoMenu.map((d) => ({ ...d, allergens: [...d.allergens] }))
  }

  const { data, error } = await supabase
    .from('dishes')
    .delete()
    .eq('id', dishId)
    .select('id')
    .maybeSingle()

  if (error) throw toApiError(error)
  if (!data) throw new ApiError('Блюдо не найдено', 404, 'unknown')
  return fetchDishes()
}

export async function togglePickRemote(dishId: string): Promise<string[]> {
  const supabase = getSupabase()
  if (!supabase) {
    demoPicked = togglePick(demoPicked, dishId)
    return [...demoPicked]
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new ApiError('Требуется вход (401). Войдите или зарегистрируйтесь.', 401, 'unauthorized')
  }

  const { data: existing, error: readErr } = await supabase
    .from('menu_picks')
    .select('id')
    .eq('user_id', user.id)
    .eq('dish_id', dishId)
    .maybeSingle()

  if (readErr) throw toApiError(readErr)

  if (existing?.id) {
    const { error: delErr } = await supabase.from('menu_picks').delete().eq('id', existing.id)
    if (delErr) throw toApiError(delErr)
  } else {
    const { error: insErr } = await supabase.from('menu_picks').insert({
      user_id: user.id,
      dish_id: dishId,
    })
    if (insErr) throw toApiError(insErr)
  }

  return fetchPicks()
}
