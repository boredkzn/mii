import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker } from './DatePicker'

describe('DatePicker', () => {
  it('вызывает onChange при выборе даты', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker date="2026-10-15" onChange={onChange} />)
    const input = screen.getByTestId('plan-date-input')
    await user.clear(input)
    await user.type(input, '2026-10-20')
    expect(onChange).toHaveBeenCalled()
  })
})
