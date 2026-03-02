import { describe, expect, it } from 'vitest'

import { validateValue } from '@/shared/lib/form/validation'

interface TestValues {
  profile: {
    email: string
    age: number
  }
}

const values: TestValues = {
  profile: {
    email: 'name@example.com',
    age: 20,
  },
}

describe('validation/validateValue', () => {
  it('возвращает ошибку required для null/undefined/пустых значений', async () => {
    const rule = [{ required: true, message: 'Поле обязательно' }]

    await expect(validateValue(undefined, values, rule)).resolves.toBe('Поле обязательно')
    await expect(validateValue(null, values, rule)).resolves.toBe('Поле обязательно')
    await expect(validateValue('', values, rule)).resolves.toBe('Поле обязательно')
    await expect(validateValue([], values, rule)).resolves.toBe('Поле обязательно')
    await expect(validateValue(false, values, rule)).resolves.toBe('Поле обязательно')
  })

  it('валидирует min для строк', async () => {
    const rule = [{ min: 3, message: 'Минимум 3 символа' }]
    await expect(validateValue('ab', values, rule)).resolves.toBe('Минимум 3 символа')
  })

  it('валидирует max для строк', async () => {
    const rule = [{ max: 3, message: 'Максимум 3 символа' }]
    await expect(validateValue('abcd', values, rule)).resolves.toBe('Максимум 3 символа')
  })

  it('валидирует min/max для чисел', async () => {
    const minRule = [{ min: 18, message: 'Минимум 18' }]
    const maxRule = [{ max: 65, message: 'Максимум 65' }]

    await expect(validateValue(16, values, minRule)).resolves.toBe('Минимум 18')
    await expect(validateValue(70, values, maxRule)).resolves.toBe('Максимум 65')
  })

  it('валидирует pattern', async () => {
    const rule = [{ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Некорректный email' }]
    await expect(validateValue('wrong-email', values, rule)).resolves.toBe('Некорректный email')
  })

  it('поддерживает async validator', async () => {
    const rule = [
      {
        validator: async (value: unknown) => {
          await Promise.resolve()
          return value === 'ok' ? undefined : 'Асинхронная ошибка'
        },
      },
    ]

    await expect(validateValue('fail', values, rule)).resolves.toBe('Асинхронная ошибка')
    await expect(validateValue('ok', values, rule)).resolves.toBeUndefined()
  })

  it('возвращает первую ошибку из набора правил', async () => {
    const rule = [
      { required: true, message: 'Ошибка 1' },
      { min: 5, message: 'Ошибка 2' },
    ]

    await expect(validateValue('', values, rule)).resolves.toBe('Ошибка 1')
  })
})
