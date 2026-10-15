import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDemoMenu } from './api/menuApi'
import { MENU } from './data/menu'
import App from './App'

vi.mock('./lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabase: () => null,
}))

describe('App MenuBoard — планировщик еды', () => {
  beforeEach(() => {
    resetDemoMenu(MENU, [])
  })

  it('отображает бренд планировщика, demo-баннер и каталог', async () => {
    render(<App />)
    expect(screen.getByText('MenuBoard')).toBeInTheDocument()
    expect(screen.getByText(/Планировщик еды · Суханова/i)).toBeInTheDocument()
    expect(await screen.findByTestId('demo-mode-banner')).toBeInTheDocument()
    expect(await screen.findByTestId('dish-d-borscht')).toBeInTheDocument()
    expect(screen.getByTestId('data-mode')).toHaveTextContent('demo')
    expect(screen.queryByText(/Зелёный угол/i)).not.toBeInTheDocument()
  })

  it('меняет дату плана в календаре', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('plan-date-input')
    const input = screen.getByTestId('plan-date-input')
    await user.clear(input)
    await user.type(input, '2026-10-20')
    expect(input).toHaveValue('2026-10-20')
  })

  it('добавляет блюдо в план и показывает КБЖУ', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('dish-d-borscht')
    await user.click(screen.getByTestId('toggle-plan-d-borscht'))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('План обновлён')
    })
    expect(screen.getByTestId('selected-panel')).toBeInTheDocument()
    expect(screen.getByTestId('day-summary')).toHaveTextContent('320')
    expect(screen.getByTestId('kbju-totals')).toHaveTextContent('ккал')
  })

  it('убирает выбранную позицию из плана дня', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('dish-d-borscht')
    await user.click(screen.getByTestId('toggle-plan-d-borscht'))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('План обновлён')
    })
    const removeBtn = screen.getByText('Убрать')
    await user.click(removeBtn)
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('убрана')
    })
    expect(screen.getByText(/пока ничего не выбрано/i)).toBeInTheDocument()
  })

  it('создаёт блюдо через форму каталога', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('dish-form')
    await user.type(screen.getByTestId('dish-title-input'), 'Тестовый суп')
    await user.click(screen.getByTestId('dish-form-submit'))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('добавлено')
    })
    expect(screen.getByText('Тестовый суп')).toBeInTheDocument()
  })

  it('удаляет блюдо из каталога', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('dish-d-borscht')
    await user.click(screen.getByTestId('delete-d-borscht'))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('удалено')
    })
    expect(screen.queryByTestId('dish-d-borscht')).not.toBeInTheDocument()
  })
})
