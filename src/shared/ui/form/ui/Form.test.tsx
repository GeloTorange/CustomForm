import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Form, type FormInstance } from '@/shared/ui/form'
import { ThirdPartyTextField, ThirdPartyToggle } from '@/shared/ui/third-party-kit'

interface DemoValues {
  profile: {
    firstName: string
    email: string
    city: string
    bio: string
  }
  settings: {
    isDeveloper: boolean
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialValues: DemoValues = {
  profile: {
    firstName: 'Oleg',
    email: 'oleg@example.com',
    city: 'Moscow',
    bio: '',
  },
  settings: {
    isDeveloper: false,
  },
}

interface CaptureProps {
  onReady: (form: FormInstance<DemoValues>) => void
}

const CaptureFormApi = ({ onReady }: CaptureProps) => {
  const form = Form.useFormInstance<DemoValues>()

  useEffect(() => {
    onReady(form)
  }, [form, onReady])

  return null
}

const BaseForm = ({
  onReady,
  onFinish,
  onFinishFailed,
  onValuesChange,
  onFieldsChange,
  children,
}: {
  onReady?: (form: FormInstance<DemoValues>) => void
  onFinish?: (values: DemoValues) => void | Promise<void>
  onFinishFailed?: (payload: { errorFields: Array<{ name: string }> }) => void | Promise<void>
  onValuesChange?: (changed: Partial<DemoValues>, all: DemoValues) => void
  onFieldsChange?: (changedFields: Array<{ name: string }>) => void
  children?: ReactNode
}) => (
  <Form<DemoValues>
    initialValues={initialValues}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    onValuesChange={onValuesChange}
    onFieldsChange={onFieldsChange}
  >
    <Form.Item
      name="profile.firstName"
      label="Имя"
      rules={[
        { required: true, message: 'Введите имя' },
        { min: 2, message: 'Минимум 2 символа' },
      ]}
    >
      <input aria-label="first-name" />
    </Form.Item>

    <Form.Item
      name="profile.email"
      label="Email"
      rules={[
        { required: true, message: 'Введите email' },
        { pattern: emailPattern, message: 'Некорректный email' },
      ]}
    >
      <input aria-label="email" />
    </Form.Item>

    <Form.Item
      name="profile.city"
      label="Город"
      rules={[{ required: true, message: 'Укажите город' }]}
    >
      <ThirdPartyTextField aria-label="city" />
    </Form.Item>

    <Form.Item
      name="settings.isDeveloper"
      label="Разработчик"
      valuePropName="checked"
      trigger="onCheckedChange"
      getValueFromEvent={(checked) => checked}
      rules={[
        {
          validator: (value) => (value === true ? undefined : 'Нужно включить переключатель'),
        },
      ]}
    >
      <ThirdPartyToggle aria-label="developer-toggle" />
    </Form.Item>

    <Form.Item
      name="profile.bio"
      label="О себе"
      rules={[{ min: 5, message: 'Минимум 5 символов' }]}
    >
      <textarea aria-label="bio" />
    </Form.Item>

    <Form.Item noStyle>
      <button type="submit">Submit</button>
    </Form.Item>

    {onReady ? <CaptureFormApi onReady={onReady} /> : null}
    {children}
  </Form>
)

describe('Form', () => {
  it('рендерит initialValues в контролах', () => {
    render(<BaseForm />)

    expect(screen.getByLabelText('first-name')).toHaveValue('Oleg')
    expect(screen.getByLabelText('email')).toHaveValue('oleg@example.com')
    expect(screen.getByLabelText('city')).toHaveValue('Moscow')
    expect(screen.getByRole('switch', { name: /developer-toggle/i })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('onFinish вызывается при валидной отправке', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()

    render(<BaseForm onFinish={onFinish} />)

    await user.clear(screen.getByLabelText('first-name'))
    await user.type(screen.getByLabelText('first-name'), 'Ivan')
    await user.clear(screen.getByLabelText('email'))
    await user.type(screen.getByLabelText('email'), 'ivan@example.com')
    await user.clear(screen.getByLabelText('city'))
    await user.type(screen.getByLabelText('city'), 'SPB')
    await user.click(screen.getByRole('switch', { name: /developer-toggle/i }))
    await user.type(screen.getByLabelText('bio'), 'Достаточно текста')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1))
    expect(onFinish.mock.calls[0][0]).toMatchObject({
      profile: {
        firstName: 'Ivan',
        email: 'ivan@example.com',
        city: 'SPB',
      },
      settings: {
        isDeveloper: true,
      },
    })
  })

  it('onFinishFailed вызывается при невалидной отправке', async () => {
    const user = userEvent.setup()
    const onFinishFailed = vi.fn()

    render(<BaseForm onFinishFailed={onFinishFailed} />)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onFinishFailed).toHaveBeenCalledTimes(1))
    expect(
      onFinishFailed.mock.calls[0][0].errorFields.map((field: { name: string }) => field.name),
    ).toContain('settings.isDeveloper')
  })

  it('setFieldValue обновляет значение и триггерит onValuesChange', async () => {
    const onValuesChange = vi.fn()
    let formApi: FormInstance<DemoValues> | undefined

    render(
      <BaseForm
        onValuesChange={onValuesChange}
        onReady={(form) => {
          formApi = form
        }}
      />,
    )

    await act(async () => {
      await formApi?.setFieldValue('profile.firstName', 'Petr', { touch: true })
    })

    expect(screen.getByLabelText('first-name')).toHaveValue('Petr')
    expect(onValuesChange).toHaveBeenCalled()
    expect(onValuesChange.mock.calls.at(-1)?.[0]).toEqual({
      profile: { firstName: 'Petr' },
    })
  })

  it('setFieldsValue обновляет несколько полей и триггерит onFieldsChange', async () => {
    const onFieldsChange = vi.fn()
    let formApi: FormInstance<DemoValues> | undefined

    render(
      <BaseForm
        onFieldsChange={onFieldsChange}
        onReady={(form) => {
          formApi = form
        }}
      />,
    )

    await act(async () => {
      await formApi?.setFieldsValue({
        profile: {
          firstName: 'Sergey',
          city: 'Kazan',
        },
      } as Partial<DemoValues>)
    })

    expect(screen.getByLabelText('first-name')).toHaveValue('Sergey')
    expect(screen.getByLabelText('city')).toHaveValue('Kazan')
    expect(onFieldsChange).toHaveBeenCalled()
    expect(
      onFieldsChange.mock.calls
        .flatMap((call: Array<Array<{ name: string }>>) => call[0])
        .map((field) => field.name),
    ).toEqual(expect.arrayContaining(['profile.firstName', 'profile.city']))
  })

  it('resetFields сбрасывает форму к initialValues', async () => {
    let formApi: FormInstance<DemoValues> | undefined

    render(
      <BaseForm
        onReady={(form) => {
          formApi = form
        }}
      />,
    )

    await act(async () => {
      await formApi?.setFieldValue('profile.firstName', 'Changed')
    })
    expect(screen.getByLabelText('first-name')).toHaveValue('Changed')

    act(() => {
      formApi?.resetFields()
    })
    expect(screen.getByLabelText('first-name')).toHaveValue('Oleg')
  })

  it('validateFields возвращает значения при успехе', async () => {
    let formApi: FormInstance<DemoValues> | undefined

    render(
      <BaseForm
        onReady={(form) => {
          formApi = form
        }}
      />,
    )

    await act(async () => {
      await formApi?.setFieldValue('settings.isDeveloper', true)
      await formApi?.setFieldValue('profile.bio', 'Полный текст')
    })

    let values: DemoValues | undefined
    await act(async () => {
      values = await formApi?.validateFields()
    })

    expect(values?.settings.isDeveloper).toBe(true)
    expect(values?.profile.firstName).toBe('Oleg')
  })

  it('validateFields бросает FormFinishFailed при ошибках', async () => {
    let formApi: FormInstance<DemoValues> | undefined

    render(
      <BaseForm
        onReady={(form) => {
          formApi = form
        }}
      />,
    )

    let capturedError: unknown
    await act(async () => {
      try {
        await formApi?.validateFields(['settings.isDeveloper'])
      } catch (error) {
        capturedError = error
      }
    })

    expect(capturedError).toMatchObject({
      errorFields: [
        expect.objectContaining({
          name: 'settings.isDeveloper',
        }),
      ],
    })
  })

  it('useFormInstance вне Form кидает ожидаемую ошибку', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const Broken = () => {
      Form.useFormInstance()
      return null
    }

    expect(() => render(<Broken />)).toThrowError('useFormInstance должен вызываться внутри <Form>.')
    consoleError.mockRestore()
  })

  it('useWatchField реактивно обновляет значение', async () => {
    let formApi: FormInstance<DemoValues> | undefined

    const Watcher = () => {
      const firstName = Form.useWatchField<DemoValues>('profile.firstName') as string
      return <div data-testid="watch-name">{firstName}</div>
    }

    render(
      <BaseForm
        onReady={(form) => {
          formApi = form
        }}
      >
        <Watcher />
      </BaseForm>,
    )

    expect(screen.getByTestId('watch-name')).toHaveTextContent('Oleg')

    await act(async () => {
      await formApi?.setFieldValue('profile.firstName', 'Nikolay')
    })

    expect(screen.getByTestId('watch-name')).toHaveTextContent('Nikolay')
  })
})

describe('Form.Item', () => {
  it('работает с обычным input по умолчанию (value/onChange)', async () => {
    const user = userEvent.setup()
    render(
      <Form<{ profile: { firstName: string } }>
        initialValues={{ profile: { firstName: 'Oleg' } }}
      >
        <Form.Item name="profile.firstName">
          <input aria-label="plain-input" />
        </Form.Item>
      </Form>,
    )

    const input = screen.getByLabelText('plain-input')
    expect(input).toHaveValue('Oleg')
    await user.clear(input)
    await user.type(input, 'Anton')

    expect(input).toHaveValue('Anton')
  })

  it('работает с ThirdPartyTextField через стандартный value/onChange', async () => {
    const user = userEvent.setup()
    render(<BaseForm />)

    const cityInput = screen.getByLabelText('city')
    await user.clear(cityInput)
    await user.type(cityInput, 'Samara')

    expect(cityInput).toHaveValue('Samara')
  })

  it('поддерживает checked + onCheckedChange для ThirdPartyToggle', async () => {
    const user = userEvent.setup()
    render(<BaseForm />)

    const toggle = screen.getByRole('switch', { name: /developer-toggle/i })
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('normalize трансформирует значение перед записью', async () => {
    const user = userEvent.setup()

    render(
      <Form<{ profile: { name: string } }>
        initialValues={{ profile: { name: '' } }}
      >
        <Form.Item
          name="profile.name"
          normalize={(value) => String(value).trim().toUpperCase()}
        >
          <input aria-label="normalized-name" />
        </Form.Item>
      </Form>,
    )

    const input = screen.getByLabelText('normalized-name')
    await user.type(input, 'ab ')
    expect(input).toHaveValue('AB')
  })

  it('getValueFromEvent переопределяет извлечение значения', async () => {
    const user = userEvent.setup()

    render(
      <Form<{ profile: { code: string } }>
        initialValues={{ profile: { code: '' } }}
      >
        <Form.Item
          name="profile.code"
          getValueFromEvent={() => 'forced'}
        >
          <input aria-label="forced-code" />
        </Form.Item>
      </Form>,
    )

    const input = screen.getByLabelText('forced-code')
    await user.type(input, 'abcd')
    expect(input).toHaveValue('forced')
  })

  it('отображает help из validation ошибки', async () => {
    const user = userEvent.setup()

    render(
      <Form<{ name: string }>
        initialValues={{ name: '' }}
      >
        <Form.Item
          name="name"
          label="Имя"
          rules={[{ required: true, message: 'Введите имя' }]}
        >
          <input aria-label="required-name" />
        </Form.Item>
        <Form.Item noStyle>
          <button type="submit">Send</button>
        </Form.Item>
      </Form>,
    )

    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText('Введите имя')).toBeInTheDocument()
  })

  it('noStyle не рендерит обертку form-item', () => {
    const { container } = render(
      <Form<{ value: string }>
        initialValues={{ value: '' }}
      >
        <Form.Item noStyle>
          <button type="button">NoStyleButton</button>
        </Form.Item>
      </Form>,
    )

    expect(container.querySelector('.form-item')).toBeNull()
  })
})
