/** Нормализация ошибок PostgREST / Auth / сети в понятные сообщения для UI. */

export class ApiError extends Error {
  readonly status: number
  readonly code: 'unauthorized' | 'forbidden' | 'server' | 'validation' | 'network' | 'unknown'

  constructor(
    message: string,
    status: number,
    code: ApiError['code'] = 'unknown',
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type LooseError = {
  message?: string
  status?: number
  statusCode?: number
  code?: string
  name?: string
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err

  if (err instanceof TypeError && /fetch|network|Failed to fetch/i.test(err.message)) {
    return new ApiError(
      'Нет связи с сервером. Проверьте интернет и URL Supabase.',
      0,
      'network',
    )
  }

  const loose = (err ?? {}) as LooseError
  const status = Number(loose.status ?? loose.statusCode ?? 0)
  const raw = String(loose.message ?? (err instanceof Error ? err.message : 'Неизвестная ошибка'))
  const codeHint = String(loose.code ?? '')

  if (status === 401 || /JWT|not authenticated|invalid.*(login|credentials)|Invalid login/i.test(raw + codeHint)) {
    return new ApiError('Требуется вход (401). Войдите или зарегистрируйтесь.', 401, 'unauthorized')
  }

  if (status === 403 || /permission|rls|row-level|not authorized|PGRST301/i.test(raw + codeHint)) {
    return new ApiError(
      'Доступ запрещён (403). Проверьте RLS-политики и роль пользователя.',
      403,
      'forbidden',
    )
  }

  if (status >= 500 || /500|internal|server error/i.test(raw)) {
    return new ApiError('Ошибка сервера (500). Смотрите Logs в Supabase Dashboard.', 500, 'server')
  }

  if (/empty|required|validation|укажите|уже есть|не найдено|не найден|заголовок/i.test(raw)) {
    return new ApiError(raw, status || 400, 'validation')
  }

  return new ApiError(raw || 'Неизвестная ошибка API', status || 0, 'unknown')
}
