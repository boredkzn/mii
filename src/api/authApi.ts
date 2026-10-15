import { toApiError, ApiError } from '../lib/apiErrors'
import { getSupabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export type AuthSnapshot = {
  user: User | null
  session: Session | null
  demo: boolean
}

export async function getAuthSnapshot(): Promise<AuthSnapshot> {
  const supabase = getSupabase()
  if (!supabase) {
    return { user: null, session: null, demo: true }
  }
  const { data, error } = await supabase.auth.getSession()
  if (error) throw toApiError(error)
  return {
    user: data.session?.user ?? null,
    session: data.session,
    demo: false,
  }
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSnapshot> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new ApiError('Demo-режим: вход не требуется (нет VITE_SUPABASE_*).', 0, 'validation')
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw toApiError(error)
  return { user: data.user, session: data.session, demo: false }
}

export async function signUpWithPassword(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthSnapshot> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new ApiError('Demo-режим: регистрация недоступна.', 0, 'validation')
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName ?? email } },
  })
  if (error) throw toApiError(error)
  return { user: data.user, session: data.session, demo: false }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw toApiError(error)
}

export function onAuthChange(callback: (snap: AuthSnapshot) => void): () => void {
  const supabase = getSupabase()
  if (!supabase) {
    callback({ user: null, session: null, demo: true })
    return () => undefined
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback({ user: session?.user ?? null, session, demo: false })
  })
  return () => data.subscription.unsubscribe()
}
