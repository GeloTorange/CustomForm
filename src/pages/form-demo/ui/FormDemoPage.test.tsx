import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormDemoPage } from '@/pages/form-demo/ui/FormDemoPage'

describe('FormDemoPage', () => {
  it('рендерит заголовок страницы и виджет формы', () => {
    render(<FormDemoPage />)

    expect(screen.getByRole('heading', { name: 'Universal Form API в стиле Antd Form' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Антд-подобная форма на react-hook-form' })).toBeInTheDocument()
  })
})
