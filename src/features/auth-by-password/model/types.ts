/**
 * Значения формы авторизации по логину и паролю.
 */
export interface AuthByPasswordValues {
  login: string
  password: string
  rememberMe: boolean
}

/**
 * Начальные значения формы авторизации.
 */
export const AUTH_BY_PASSWORD_INITIAL_VALUES: AuthByPasswordValues = {
  login: '',
  password: '',
  rememberMe: false,
}

