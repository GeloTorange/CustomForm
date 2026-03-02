import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from '@/app/App'

describe('App', () => {
  it('рендерит оболочку приложения и демо-страницу', () => {
    const { container } = render(<App />)

    expect(container.querySelector('.app-shell')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Universal Form API в стиле Antd Form' })).toBeInTheDocument()
  })
})
