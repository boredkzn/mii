import { MENU, type Dish, type MealSlot, type PlanEntry } from '../data/menu'
import { toApiError, ApiError } from '../lib/apiErrors'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import {
  dishToRow,
  rowToDish,
  rowToPlanEntry,
  type DishInput,
  type DishRow,
  type PlanEntryRow,
} from '../types/menu'
import { isDishPlannedOnDate } from '../utils/menuLogic'

/** In-memory demo store (когда нет VITE_SUPABASE_*). */
let demoMenu: Dish[] = MENU.map((d) => ({ ...d, allergens: [...d.allergens] }))
let demoPlan: PlanEntry[] = []

export function resetDemoMenu(seed: Dish[] = MENU, plan: PlanEntry[] = []) {
  demoMenu = seed.map((d) => ({ ...d, allergens: [...d.allergens] }))
  demoPlan = plan.map((e) => ({ ...e }))
}

export function getDataMode(): 'supabase' | 'demo' {
  return isSupabaseConfigured() ? 'supabase' : 'demo'
}

function makeId(kind: string): string {
  return `d-${kind}-${Date.now().toString(36)}`
}

function makePlanId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function cloneDish(d: Dish): Dish {
  return { ...d, allergens: [...d.allergens] }
}

export async function fetchDishes(): Promise<Dish[]> {
  const supabase = getSupabase()
  if (!supabase) {
    return demoMenu.map(cloneDish)
  }

  const { data, error } = await supabase
    .from('dishes')
    .select('id, title, kind, calories, protein, fat, carbs, allergens')
    .order('kind', { ascending: true })
    .order('title', { ascending: true })

  if (error) throw toApiError(error)
  return ((data ?? []) as DishRow[]).map(rowToDish)
}

export async function fetchPlanEntries(): Promise<PlanEntry[]> {
  const supabase = getSupabase()
  if (!supabase) {
    return demoPlan.map((e) => ({ ...e }))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('plan_entries')
    .select('id, dish_id, user_id, plan_date, meal_slot, created_at')
    .eq('user_id', user.id)
    .order('plan_date', { ascending: true })

  if (error) throw toApiError(error)
  return ((data ?? []) as PlanEntryRow[]).map(rowToPlanEntry)
}

/** @deprecated use fetchPlanEntries — оставлено для ясности миграции тестов */
export async function fetchPicks(): Promise<PlanEntry[]> {
  return fetchPlanEntries()
}

function validateMacros(input: DishInput) {
  if (input.calories < 0 || input.protein < 0 || input.fat < 0 || input.carbs < 0) {
    throw new ApiError('КБЖУ не могут быть отрицательными', 400, 'validation')
  }
}

export async function createDishRemote(input: DishInput): Promise<Dish[]> {
  const title = input.title.trim()
  if (!title) {
    throw new ApiError('Укажите название блюда', 400, 'validation')
  }
  validateMacros(input)

  const dish: Dish = {
    id: input.id?.trim() || makeId(input.kind),
    title,
    kind: input.kind,
    calories: input.calories,
    protein: input.protein,
    fat: input.fat,
    carbs: input.carbs,
    allergens: input.allergens.map((a) => a.trim()).filter(Boolean),
  }

  const supabase = getSupabase()
  if (!supabase) {
    if (demoMenu.some((d) => d.id === dish.id)) {
      throw new ApiError('Блюдо с таким id уже есть', 400, 'validation')
    }
    demoMenu = [...demoMenu, dish]
    return demoMenu.map(cloneDish)
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
  validateMacros(input)

  const patch = {
    title,
    kind: input.kind,
    calories: input.calories,
    protein: input.protein,
    fat: input.fat,
    carbs: input.carbs,
    allergens: input.allergens.map((a) => a.trim()).filter(Boolean),
  }

  const supabase = getSupabase()
  if (!supabase) {
    const idx = demoMenu.findIndex((d) => d.id === dishId)
    if (idx < 0) throw new ApiError('Блюдо не найдено', 404, 'unknown')
    demoMenu = demoMenu.map((d) =>
      d.id === dishId
        ? {
            ...d,
            ...patch,
            allergens: [...patch.allergens],
          }
        : d,
    )
    return demoMenu.map(cloneDish)
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
    demoPlan = demoPlan.filter((e) => e.dishId !== dishId)
    return demoMenu.map(cloneDish)
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

/** Добавить блюдо в план на дату (если ещё нет). */
export async function addToPlan(
  dishId: string,
  planDate: string,
  mealSlot: MealSlot | null = null,
): Promise<PlanEntry[]> {
  const supabase = getSupabase()
  if (!supabase) {
    if (!demoMenu.some((d) => d.id === dishId)) {
      throw new ApiError('Блюдо не найдено', 404, 'unknown')
    }
    if (isDishPlannedOnDate(demoPlan, dishId, planDate)) {
      return demoPlan.map((e) => ({ ...e }))
    }
    demoPlan = [
      ...demoPlan,
      { id: makePlanId(), dishId, planDate, mealSlot },
    ]
    return demoPlan.map((e) => ({ ...e }))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new ApiError('Требуется вход (401). Войдите или зарегистрируйтесь.', 401, 'unauthorized')
  }

  const { data: existing, error: readErr } = await supabase
    .from('plan_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('dish_id', dishId)
    .eq('plan_date', planDate)
    .maybeSingle()

  if (readErr) throw toApiError(readErr)
  if (existing?.id) return fetchPlanEntries()

  const { error: insErr } = await supabase.from('plan_entries').insert({
    user_id: user.id,
    dish_id: dishId,
    plan_date: planDate,
    meal_slot: mealSlot,
  })
  if (insErr) throw toApiError(insErr)
  return fetchPlanEntries()
}

/** Удалить позицию из плана (по id записи). */
export async function removeFromPlan(entryId: string): Promise<PlanEntry[]> {
  const supabase = getSupabase()
  if (!supabase) {
    if (!demoPlan.some((e) => e.id === entryId)) {
      throw new ApiError('Позиция плана не найдена', 404, 'unknown')
    }
    demoPlan = demoPlan.filter((e) => e.id !== entryId)
    return demoPlan.map((e) => ({ ...e }))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new ApiError('Требуется вход (401). Войдите или зарегистрируйтесь.', 401, 'unauthorized')
  }

  const { data, error } = await supabase
    .from('plan_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) throw toApiError(error)
  if (!data) throw new ApiError('Позиция плана не найдена', 404, 'unknown')
  return fetchPlanEntries()
}

/** Переключить блюдо в плане на выбранную дату. */
export async function togglePlanRemote(
  dishId: string,
  planDate: string,
): Promise<PlanEntry[]> {
  const supabase = getSupabase()
  if (!supabase) {
    const existing = demoPlan.find((e) => e.dishId === dishId && e.planDate === planDate)
    if (existing) return removeFromPlan(existing.id)
    return addToPlan(dishId, planDate)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new ApiError('Требуется вход (401). Войдите или зарегистрируйтесь.', 401, 'unauthorized')
  }

  const { data: existing, error: readErr } = await supabase
    .from('plan_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('dish_id', dishId)
    .eq('plan_date', planDate)
    .maybeSingle()

  if (readErr) throw toApiError(readErr)

  if (existing?.id) {
    return removeFromPlan(existing.id)
  }
  return addToPlan(dishId, planDate)
}
