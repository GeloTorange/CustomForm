import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from '@/app/App'

describe('App', () => {
  it('рендерит оболочку приложения и страницу авторизации', () => {
    const { container } = render(<App />)

    expect(container.querySelector('.app-shell')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Добро пожаловать!' })).toBeInTheDocument()
  })
})
