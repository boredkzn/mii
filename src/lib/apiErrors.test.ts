import { describe, expect, it } from 'vitest'
import { ApiError, toApiError } from './apiErrors'

describe('toApiError', () => {
  it('пробрасывает ApiError без изменений', () => {
    const original = new ApiError('x', 401, 'unauthorized')
    expect(toApiError(original)).toBe(original)
  })

  it('мапит 401', () => {
    const err = toApiError({ message: 'JWT expired', status: 401 })
    expect(err.status).toBe(401)
    expect(err.code).toBe('unauthorized')
    expect(err.message).toMatch(/401/)
  })

  it('мапит 403 / RLS', () => {
    const err = toApiError({ message: 'new row violates row-level security policy', status: 403 })
    expect(err.code).toBe('forbidden')
    expect(err.message).toMatch(/403/)
  })

  it('мапит 500', () => {
    const err = toApiError({ message: 'Internal server error', status: 500 })
    expect(err.code).toBe('server')
    expect(err.message).toMatch(/500/)
  })

  it('мапит сетевые сбои', () => {
    const err = toApiError(new TypeError('Failed to fetch'))
    expect(err.code).toBe('network')
    expect(err.status).toBe(0)
  })
})
