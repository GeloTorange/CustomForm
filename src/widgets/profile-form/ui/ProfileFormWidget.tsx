import { useCallback, useState } from 'react'

import {
  Form,
  type FormFieldData,
  type FormFinishFailed,
} from '@/shared/ui/form'
import { FormButtonItem, FormInputItem } from '@/shared/ui/form-items'
import {
  ThirdPartyToggle,
} from '@/shared/ui/third-party-kit'
import {
  PROFILE_FORM_INITIAL_VALUES,
  type ProfileFormValues,
} from '@/widgets/profile-form/model/types'
import '@/widgets/profile-form/ui/profile-form-widget.css'

// Регулярное выражение для базовой проверки email-формата.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Кнопка сброса использует form instance из контекста.
const ResetButton = () => {
  const form = Form.useFormInstance<ProfileFormValues>()

  return (
    <FormButtonItem
      noStyle
      buttonProps={{
        type: 'button',
        variant: 'secondary',
        onClick: () => form.resetFields(),
      }}
    >
      Сбросить
    </FormButtonItem>
  )
}

// Блок "живого" предпросмотра, который читает значения через useWatchField.
const LiveSummary = () => {
  const firstName = Form.useWatchField<ProfileFormValues>('profile.firstName') as string
  const email = Form.useWatchField<ProfileFormValues>('profile.email') as string
  const city = Form.useWatchField<ProfileFormValues>('profile.city') as string
  const isDeveloper = Form.useWatchField<ProfileFormValues>(
    'settings.isDeveloper',
  ) as boolean

  return (
    <div className="profile-form-widget__live">
      <h3 className="profile-form-widget__live-title">Live preview из form context</h3>
      <div className="profile-form-widget__live-row">
        <span>Имя</span>
        <span>{firstName || '-'}</span>
      </div>
      <div className="profile-form-widget__live-row">
        <span>Email</span>
        <span>{email || '-'}</span>
      </div>
      <div className="profile-form-widget__live-row">
        <span>Город</span>
        <span>{city || '-'}</span>
      </div>
      <div className="profile-form-widget__live-row">
        <span>Разработчик</span>
        <span>{isDeveloper ? 'Да' : 'Нет'}</span>
      </div>
    </div>
  )
}

// Форматирует объект в читаемый JSON для debug-панелей.
const serialize = (value: unknown): string => JSON.stringify(value, null, 2)

// Главный виджет с демонстрацией API формы и интеграции сторонних контролов.
export const ProfileFormWidget = () => {
  const [lastChangedValues, setLastChangedValues] = useState<Partial<ProfileFormValues>>({})
  const [allValues, setAllValues] = useState<ProfileFormValues>(PROFILE_FORM_INITIAL_VALUES)
  const [lastChangedFields, setLastChangedFields] = useState<FormFieldData<ProfileFormValues>[]>(
    [],
  )
  const [submittedValues, setSubmittedValues] = useState<ProfileFormValues | null>(null)
  const [submitErrors, setSubmitErrors] = useState<FormFieldData<ProfileFormValues>[]>([])

  // Обновляет debug-состояние при изменении значений формы.
  const handleValuesChange = useCallback(
    (changedValues: Partial<ProfileFormValues>, nextValues: ProfileFormValues) => {
      setLastChangedValues(changedValues)
      setAllValues(nextValues)
    },
    [],
  )

  // Обновляет debug-состояние при изменении состояния полей.
  const handleFieldsChange = useCallback(
    (changedFields: FormFieldData<ProfileFormValues>[]) => {
      setLastChangedFields(changedFields)
    },
    [],
  )

  // Обработчик успешной отправки формы.
  const handleFinish = useCallback(async (values: ProfileFormValues) => {
    setSubmittedValues(values)
    setSubmitErrors([])
  }, [])

  // Обработчик неуспешной отправки формы.
  const handleFinishFailed = useCallback(
    async (payload: FormFinishFailed<ProfileFormValues>) => {
      setSubmitErrors(payload.errorFields)
    },
    [],
  )

  return (
    <section className="profile-form-widget">
      <h2 className="profile-form-widget__title">Антд-подобная форма на react-hook-form</h2>
      <p className="profile-form-widget__description">
        Для компонентов со стандартным API `value/onChange` достаточно обычного `Form.Item`.
        Для нестандартных контролов доступны адаптеры через `valuePropName`, `trigger`,
        `getValueFromEvent`.
      </p>

      <Form<ProfileFormValues>
        initialValues={PROFILE_FORM_INITIAL_VALUES}
        onValuesChange={handleValuesChange}
        onFieldsChange={handleFieldsChange}
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
      >
        <FormInputItem<ProfileFormValues>
          name="profile.firstName"
          label="Имя"
          rules={[
            { required: true, message: 'Введите имя' },
            { min: 2, message: 'Минимум 2 символа' },
          ]}
          inputProps={{
            placeholder: 'Олег',
            'aria-label': 'first-name',
          }}
        />

        <FormInputItem<ProfileFormValues>
          name="profile.email"
          label="Email"
          rules={[
            { required: true, message: 'Введите email' },
            { pattern: emailPattern, message: 'Некорректный email' },
          ]}
          inputProps={{
            type: 'email',
            placeholder: 'name@company.com',
            'aria-label': 'email',
          }}
        />

        <FormInputItem<ProfileFormValues>
          name="profile.city"
          label="Город (компонент стороннего UI kit)"
          rules={[{ required: true, message: 'Укажите город' }]}
          inputProps={{
            placeholder: 'Москва',
            'aria-label': 'city',
          }}
        />

        <Form.Item
          name="settings.isDeveloper"
          label="Подтверждение"
          // Настройка адаптера для компонента с checked/onCheckedChange.
          valuePropName="checked"
          trigger="onCheckedChange"
          getValueFromEvent={(checked) => checked}
          rules={[
            {
              validator: (value) =>
                value === true ? undefined : 'Нужно включить переключатель для демо',
            },
          ]}
        >
          <ThirdPartyToggle />
        </Form.Item>

        <Form.Item
          name="profile.bio"
          label="О себе"
          rules={[{ min: 10, message: 'Минимум 10 символов' }]}
        >
          <textarea rows={4} placeholder="Краткое описание..." />
        </Form.Item>

        <Form.Item noStyle>
          <div className="profile-form-widget__actions">
            <FormButtonItem<ProfileFormValues>
              noStyle
              buttonProps={{ type: 'submit' }}
            >
              Отправить
            </FormButtonItem>
            <ResetButton />
          </div>
        </Form.Item>

        <LiveSummary />
      </Form>

      <div className="profile-form-widget__debug">
        <div className="profile-form-widget__debug-grid">
          <div className="profile-form-widget__debug-card">
            <h4>onValuesChange: changedValues</h4>
            <pre>{serialize(lastChangedValues)}</pre>
          </div>
          <div className="profile-form-widget__debug-card">
            <h4>onValuesChange: allValues</h4>
            <pre>{serialize(allValues)}</pre>
          </div>
          <div className="profile-form-widget__debug-card">
            <h4>onFieldsChange: changedFields</h4>
            <pre>{serialize(lastChangedFields)}</pre>
          </div>
          <div className="profile-form-widget__debug-card">
            <h4>onFinish / onFinishFailed</h4>
            <pre>{serialize(submittedValues ?? submitErrors)}</pre>
          </div>
        </div>
      </div>
    </section>
  )
}
