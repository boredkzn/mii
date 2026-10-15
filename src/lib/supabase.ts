import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return true
  const v = value.trim()
  return (
    !v ||
    v.includes('PASTE_') ||
    v.includes('YOUR_PROJECT') ||
    v.includes('YOUR_SUPABASE') ||
    v === 'https://YOUR_PROJECT_REF.supabase.co'
  )
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    url &&
      anonKey &&
      !looksLikePlaceholder(url) &&
      !looksLikePlaceholder(anonKey) &&
      url.startsWith('http'),
  )
}

let client: SupabaseClient | null = null

/** Возвращает клиент или null в demo-режиме (без .env). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}

/** Только для тестов: сброс синглтона. */
export function __resetSupabaseClientForTests() {
  client = null
}
