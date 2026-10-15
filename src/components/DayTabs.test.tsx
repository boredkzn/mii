import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DayTabs } from './DayTabs'

describe('DayTabs', () => {
  it('вызывает onChange при выборе дня', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DayTabs day="mon" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Пт' }))
    expect(onChange).toHaveBeenCalledWith('fri')
  })
})
