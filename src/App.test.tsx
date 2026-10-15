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

describe('App MenuBoard', () => {
  beforeEach(() => {
    resetDemoMenu(MENU, [])
  })

  it('отображает бренд, demo-баннер и блюда понедельника', async () => {
    render(<App />)
    expect(screen.getByText('MenuBoard')).toBeInTheDocument()
    expect(await screen.findByTestId('demo-mode-banner')).toBeInTheDocument()
    expect(await screen.findByTestId('dish-d-mon-soup')).toBeInTheDocument()
    expect(screen.getByTestId('data-mode')).toHaveTextContent('demo')
  })

  it('переключает день на вторник', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('dish-d-mon-soup')
    await user.click(screen.getByRole('button', { name: 'Вт' }))
    expect(screen.getByTestId('dish-d-tue-soup')).toBeInTheDocument()
    expect(screen.queryByTestId('dish-d-mon-soup')).not.toBeInTheDocument()
  })

  it('отмечает блюдо и обновляет итог', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('dish-d-mon-soup')
    await user.click(screen.getByTestId('dish-d-mon-soup').querySelector('button')!)
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Выбор обновлён')
    })
    expect(screen.getByTestId('pick-summary')).toHaveTextContent('1')
  })

  it('создаёт блюдо через форму', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('dish-form')
    await user.type(screen.getByTestId('dish-title-input'), 'Тестовый суп')
    await user.click(screen.getByTestId('dish-form-submit'))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Блюдо добавлено')
    })
    expect(screen.getByText('Тестовый суп')).toBeInTheDocument()
  })

  it('удаляет блюдо', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByTestId('dish-d-mon-soup')
    await user.click(screen.getByTestId('delete-d-mon-soup'))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Блюдо удалено')
    })
    expect(screen.queryByTestId('dish-d-mon-soup')).not.toBeInTheDocument()
  })
})
