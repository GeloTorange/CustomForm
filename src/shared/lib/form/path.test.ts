import { describe, expect, it } from 'vitest'

import {
  buildValuesFromPaths,
  collectLeafPaths,
  getValueByPath,
  isEqual,
  setValueByPath,
  toPath,
} from '@/shared/lib/form/path'

describe('path/toPath', () => {
  it('корректно разбивает "profile.name" на сегменты', () => {
    expect(toPath('profile.name')).toEqual(['profile', 'name'])
  })

  it('удаляет лишние пробелы и пустые части', () => {
    expect(toPath(' profile . name . ')).toEqual(['profile', 'name'])
  })
})

describe('path/getValueByPath', () => {
  it('возвращает вложенное значение по пути', () => {
    const source = { profile: { name: 'Oleg' } }
    expect(getValueByPath(source, 'profile.name')).toBe('Oleg')
  })

  it('возвращает undefined для несуществующего пути', () => {
    const source = { profile: { name: 'Oleg' } }
    expect(getValueByPath(source, 'profile.email')).toBeUndefined()
  })
})

describe('path/setValueByPath', () => {
  it('иммутабельно устанавливает значение по пути', () => {
    const source = { profile: { name: 'Oleg' } }
    const result = setValueByPath(source, 'profile.name', 'Ivan')

    expect(result).toEqual({ profile: { name: 'Ivan' } })
  })

  it('не мутирует исходный объект', () => {
    const source = { profile: { name: 'Oleg' } }
    void setValueByPath(source, 'profile.name', 'Ivan')

    expect(source).toEqual({ profile: { name: 'Oleg' } })
  })
})

describe('path/collectLeafPaths', () => {
  it('собирает листовые пути вложенного объекта', () => {
    const source = {
      profile: { firstName: 'Oleg', city: 'Moscow' },
      settings: { isDeveloper: true },
    }

    expect(collectLeafPaths(source).sort()).toEqual(
      ['profile.firstName', 'profile.city', 'settings.isDeveloper'].sort(),
    )
  })
})

describe('path/buildValuesFromPaths', () => {
  it('строит partial-объект только по указанным путям', () => {
    const source = {
      profile: { firstName: 'Oleg', city: 'Moscow' },
      settings: { isDeveloper: true },
    }

    expect(buildValuesFromPaths(['profile.city'], source)).toEqual({
      profile: { city: 'Moscow' },
    })
  })
})

describe('path/isEqual', () => {
  it('сравнивает примитивы, массивы и объекты корректно', () => {
    expect(isEqual('a', 'a')).toBe(true)
    expect(isEqual([1, { a: 2 }], [1, { a: 2 }])).toBe(true)
    expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true)
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false)
  })
})
