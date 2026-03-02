import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ProfileFormWidget } from '@/widgets/profile-form/ui/ProfileFormWidget'

const fillValidForm = async () => {
  const user = userEvent.setup()

  await user.type(screen.getByPlaceholderText('Олег'), 'Иван')
  await user.type(screen.getByPlaceholderText('name@company.com'), 'ivan@example.com')
  await user.type(screen.getByPlaceholderText('Москва'), 'Казань')
  await user.type(screen.getByPlaceholderText('Краткое описание...'), 'Длинное описание профиля')
  await user.click(screen.getByRole('switch'))

  return user
}

describe('ProfileFormWidget', () => {
  it('показывает live summary при изменении полей', async () => {
    const user = userEvent.setup()
    render(<ProfileFormWidget />)

    await user.type(screen.getByPlaceholderText('Олег'), 'Иван')

    const liveTitle = screen.getByText('Live preview из form context')
    const liveBlock = liveTitle.closest('div')
    expect(liveBlock).not.toBeNull()
    expect(liveBlock).toHaveTextContent('Иван')
  })

  it('обновляет debug-блоки onValuesChange и onFieldsChange', async () => {
    const user = userEvent.setup()
    render(<ProfileFormWidget />)

    await user.type(screen.getByPlaceholderText('Москва'), 'Казань')

    const valuesCard = screen
      .getByText('onValuesChange: allValues')
      .closest('.profile-form-widget__debug-card')
    const fieldsCard = screen
      .getByText('onFieldsChange: changedFields')
      .closest('.profile-form-widget__debug-card')

    expect(valuesCard).not.toBeNull()
    expect(fieldsCard).not.toBeNull()
    expect(valuesCard).toHaveTextContent('"city": "Казань"')
    expect(fieldsCard).toHaveTextContent('profile.city')
  })

  it('успешный submit показывает submittedValues', async () => {
    render(<ProfileFormWidget />)
    const user = await fillValidForm()

    await user.click(screen.getByRole('button', { name: 'Отправить' }))

    const resultCard = screen
      .getByText('onFinish / onFinishFailed')
      .closest('.profile-form-widget__debug-card')
    expect(resultCard).not.toBeNull()

    await waitFor(() => {
      expect(resultCard).toHaveTextContent('"firstName": "Иван"')
      expect(resultCard).toHaveTextContent('"isDeveloper": true')
    })
  })

  it('неуспешный submit показывает errorFields', async () => {
    const user = userEvent.setup()
    render(<ProfileFormWidget />)

    await user.click(screen.getByRole('button', { name: 'Отправить' }))

    const resultCard = screen
      .getByText('onFinish / onFinishFailed')
      .closest('.profile-form-widget__debug-card')
    expect(resultCard).not.toBeNull()

    await waitFor(() => {
      expect(resultCard).toHaveTextContent('profile.firstName')
      expect(resultCard).toHaveTextContent('settings.isDeveloper')
    })

    const submitButton = screen.getByRole('button', { name: 'Отправить' })
    expect(within(resultCard as HTMLElement).queryByText('null')).toBeNull()
    expect(submitButton).toBeInTheDocument()
  })
})
