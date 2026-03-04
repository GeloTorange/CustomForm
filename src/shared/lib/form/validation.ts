import type { FormValues, ValidationRule } from '@/shared/lib/form/types'

/**
 * Определяет, считать ли значение пустым для required-валидации.
 *
 * @param value Проверяемое значение.
 * @returns `true`, если значение трактуется как пустое.
 */
const isValueEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length === 0
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'boolean') {
    return value === false
  }

  return false
}

/**
 * Возвращает длину строки или массива, если это применимо к значению.
 *
 * @param value Проверяемое значение.
 * @returns Число символов/элементов или `undefined`.
 */
const resolveLength = (value: unknown): number | undefined => {
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length
  }

  return undefined
}

/**
 * Возвращает сообщение ошибки: пользовательское или fallback.
 *
 * @param fallback Текст ошибки по умолчанию.
 * @param message Пользовательский текст ошибки из правила.
 * @returns Итоговый текст ошибки.
 */
const resolveErrorMessage = (fallback: string, message?: string): string =>
  message?.trim() ? message : fallback

/**
 * Валидирует значение по набору правил и возвращает первую найденную ошибку.
 *
 * @template TValues Тип объекта всех значений формы.
 * @param value Текущее значение поля.
 * @param values Все значения формы.
 * @param rules Набор правил валидации.
 * @returns Текст ошибки или `undefined`, если ошибок нет.
 */
export const validateValue = async <TValues extends FormValues>(
  value: unknown,
  values: TValues,
  rules: ValidationRule<TValues>[],
): Promise<string | undefined> => {
  for (const rule of rules) {
    if (rule.required && isValueEmpty(value)) {
      return resolveErrorMessage('Поле обязательно', rule.message)
    }

    if (rule.min !== undefined) {
      if (typeof value === 'number' && value < rule.min) {
        return resolveErrorMessage(`Минимальное значение: ${rule.min}`, rule.message)
      }

      const length = resolveLength(value)
      if (length !== undefined && length < rule.min) {
        return resolveErrorMessage(`Минимум ${rule.min} символов`, rule.message)
      }
    }

    if (rule.max !== undefined) {
      if (typeof value === 'number' && value > rule.max) {
        return resolveErrorMessage(`Максимальное значение: ${rule.max}`, rule.message)
      }

      const length = resolveLength(value)
      if (length !== undefined && length > rule.max) {
        return resolveErrorMessage(`Максимум ${rule.max} символов`, rule.message)
      }
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return resolveErrorMessage('Неверный формат значения', rule.message)
    }

    if (rule.validator) {
      const result = await rule.validator(value, values)
      if (typeof result === 'string' && result.trim()) {
        return result
      }
    }
  }

  return undefined
}
