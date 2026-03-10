import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Form } from '@/shared/ui/form'
import { FormButtonItem, FormInputItem } from '@/shared/ui/form-items'

describe('FormInputItem', () => {
  it('переиспользует Form.Item со сторонним input-компонентом', async () => {
    const user = userEvent.setup()

    render(
      <Form<{ profile: { city: string } }>
        initialValues={{ profile: { city: 'Moscow' } }}
      >
        <FormInputItem<{ profile: { city: string } }>
          name="profile.city"
          label="Город"
          inputProps={{ 'aria-label': 'city-reusable' }}
        />
      </Form>,
    )

    const input = screen.getByLabelText('city-reusable')
    expect(input).toHaveClass('kit-text-field')
    expect(input).toHaveValue('Moscow')

    await user.clear(input)
    await user.type(input, 'Kazan')
    expect(input).toHaveValue('Kazan')
  })
})

describe('FormButtonItem', () => {
  it('рендерит action-кнопку стороннего UI kit внутри Form.Item', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Form<{ profile: { city: string } }>
        initialValues={{ profile: { city: 'Moscow' } }}
      >
        <FormButtonItem<{ profile: { city: string } }> noStyle buttonProps={{ variant: 'secondary', onClick }}>
          Action
        </FormButtonItem>
      </Form>,
    )

    const button = screen.getByRole('button', { name: 'Action' })
    expect(button).toHaveClass('kit-button')
    expect(button).toHaveClass('kit-button--secondary')

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
