import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoginPage } from '@/pages/login'

describe('LoginPage', () => {
  it('рендерит заголовок и элементы формы авторизации', () => {
    render(<LoginPage />)

    expect(screen.getByRole('heading', { name: 'Добро пожаловать!' })).toBeInTheDocument()
    expect(screen.getByLabelText('Логин')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })
})

