import { useState } from 'react'

import { FormButtonItem, FormInputItem } from '@/shared/ui/form-items'
import { Form } from '@/shared/ui/form'
import { JoinX5Input } from '@/shared/ui/join-x5'
import type { AuthByPasswordValues } from '@/features/auth-by-password/model/types'
import { AUTH_BY_PASSWORD_INITIAL_VALUES } from '@/features/auth-by-password/model/types'
import '@/features/auth-by-password/ui/auth-by-password-form.css'

/**
 * Форма входа по логину и паролю.
 *
 * @returns JSX-элемент формы авторизации.
 */
export const AuthByPasswordForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  /**
   * Обработчик отправки формы.
   * Пока форма демонстрационная, поэтому результат просто завершается без побочных действий.
   */
  const handleFinish = async () => undefined

  return (
    <Form<AuthByPasswordValues>
      initialValues={AUTH_BY_PASSWORD_INITIAL_VALUES}
      onFinish={handleFinish}
    >
      <div className="auth-by-password-form">
        <div className="auth-by-password-form__fields">
          <FormInputItem<AuthByPasswordValues>
            name="login"
            className="auth-by-password-form__field"
            rules={[{ required: true, message: 'Введите логин' }]}
            inputProps={{
              className: 'auth-by-password-form__input',
              placeholder: 'Логин',
              autoComplete: 'username',
              'aria-label': 'Логин',
            }}
          />

          <Form.Item<AuthByPasswordValues>
            name="password"
            className="auth-by-password-form__field"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            {({ value, onChange, onBlur, name }) => (
              <div className="auth-by-password-form__password">
                <JoinX5Input
                  className="kit-text-field auth-by-password-form__input"
                  value={typeof value === 'string' ? value : ''}
                  name={name}
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Пароль"
                  aria-label="Пароль"
                  onChange={(event) => onChange(event)}
                  onBlur={onBlur}
                />
                <button
                  className="auth-by-password-form__password-toggle"
                  type="button"
                  aria-label={
                    isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'
                  }
                  onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                />
              </div>
            )}
          </Form.Item>
        </div>

        <div className="auth-by-password-form__meta">
          <Form.Item<AuthByPasswordValues>
            name="rememberMe"
            noStyle
            valuePropName="checked"
            getValueFromEvent={(event) =>
              event && typeof event === 'object' && 'target' in event
                ? (event.target as HTMLInputElement).checked
                : Boolean(event)
            }
          >
            {({ value, onChange, name }) => (
              <label className="auth-by-password-form__remember">
                <input
                  type="checkbox"
                  name={name}
                  checked={Boolean(value)}
                  aria-label="Запомнить меня"
                  onChange={(event) => onChange(event)}
                />
                <span>Запомнить меня</span>
              </label>
            )}
          </Form.Item>

          <a className="auth-by-password-form__forgot" href="/">
            Забыл пароль
          </a>
        </div>

        <FormButtonItem<AuthByPasswordValues>
          noStyle
          buttonProps={{
            type: 'submit',
            className: 'auth-by-password-form__submit',
          }}
        >
          Войти
        </FormButtonItem>
      </div>
    </Form>
  )
}
