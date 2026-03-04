type AnyObject = Record<string, unknown>

/**
 * Проверяет, что значение является "простым" объектом, а не массивом или примитивом.
 *
 * @param value Проверяемое значение.
 * @returns `true`, если значение можно трактовать как объект-словарь.
 */
const isPlainObject = (value: unknown): value is AnyObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * Преобразует строковый путь вида `user.profile.name` в массив сегментов.
 *
 * @param name Строковый путь до поля.
 * @returns Массив сегментов пути.
 */
export const toPath = (name: string): string[] =>
  name
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)

/**
 * Безопасно получает значение по вложенному пути из произвольного объекта.
 *
 * @param source Источник, из которого нужно прочитать значение.
 * @param name Путь до поля в dot-notation.
 * @returns Найденное значение или `undefined`, если путь не существует.
 */
export const getValueByPath = (source: unknown, name: string): unknown => {
  const parts = toPath(name)
  if (parts.length === 0) {
    return source
  }

  let current: unknown = source
  for (const part of parts) {
    if (!isPlainObject(current)) {
      return undefined
    }
    current = current[part]
  }

  return current
}

/**
 * Рекурсивно создаёт новую структуру объекта и устанавливает значение по пути.
 *
 * @param source Текущий уровень исходного объекта.
 * @param parts Оставшиеся сегменты пути.
 * @param value Значение для установки.
 * @returns Новый уровень объекта с применённым значением.
 */
const setByParts = (source: unknown, parts: string[], value: unknown): unknown => {
  if (parts.length === 0) {
    return value
  }

  const [head, ...tail] = parts
  const current = isPlainObject(source) ? source : {}

  return {
    ...current,
    [head]: setByParts(current[head], tail, value),
  }
}

/**
 * Иммутабельно устанавливает значение по строковому пути.
 *
 * @template TSource Тип исходного объекта.
 * @param source Исходный объект.
 * @param name Путь в формате `a.b.c`.
 * @param value Новое значение.
 * @returns Новый объект с обновлённым значением.
 */
export const setValueByPath = <TSource>(source: TSource, name: string, value: unknown): TSource => {
  const parts = toPath(name)
  if (parts.length === 0) {
    return source
  }

  return setByParts(source, parts, value) as TSource
}

/**
 * Глубоко объединяет два plain object, сохраняя вложенную структуру.
 *
 * @param source Базовый объект.
 * @param patch Объект-патч.
 * @returns Результат глубокого merge.
 */
const mergePlainObjects = (source: AnyObject, patch: AnyObject): AnyObject => {
  const result: AnyObject = { ...source }

  for (const [key, patchValue] of Object.entries(patch)) {
    const currentValue = result[key]
    if (isPlainObject(currentValue) && isPlainObject(patchValue)) {
      result[key] = mergePlainObjects(currentValue, patchValue)
      continue
    }

    result[key] = patchValue
  }

  return result
}

/**
 * Публичный helper для глубокого merge типизированных объектов.
 *
 * @template TSource Тип исходного объекта.
 * @param source Базовый объект.
 * @param patch Частичный патч для обновления.
 * @returns Новый объект после merge.
 */
export const mergeDeep = <TSource extends object>(
  source: TSource,
  patch: Partial<TSource>,
): TSource => mergePlainObjects(source as AnyObject, patch as AnyObject) as TSource

/**
 * Рекурсивно собирает листовые пути объекта (например `profile.name`, `settings.theme`).
 *
 * @param source Текущая часть структуры.
 * @param prefix Префикс текущего пути.
 * @returns Массив leaf-путей.
 */
const collectLeafPathsInternal = (source: unknown, prefix: string): string[] => {
  if (!isPlainObject(source)) {
    return prefix ? [prefix] : []
  }

  const entries = Object.entries(source)
  if (entries.length === 0) {
    return prefix ? [prefix] : []
  }

  const result: string[] = []
  for (const [key, value] of entries) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key
    result.push(...collectLeafPathsInternal(value, nextPrefix))
  }

  return result
}

/**
 * Возвращает все leaf-пути переданного значения.
 *
 * @param source Объект со вложенными полями.
 * @returns Массив путей в dot-notation.
 */
export const collectLeafPaths = (source: unknown): string[] =>
  collectLeafPathsInternal(source, '')

/**
 * Строит partial-объект только из переданных путей, копируя значения из `source`.
 *
 * @template TValues Тип полного объекта значений.
 * @param paths Список путей, которые нужно включить в результат.
 * @param source Полный объект значений.
 * @returns Частичный объект, содержащий только выбранные пути.
 */
export const buildValuesFromPaths = <TValues extends object>(
  paths: string[],
  source: TValues,
): Partial<TValues> => {
  let result: Partial<TValues> = {}

  for (const path of paths) {
    result = setValueByPath(result, path, getValueByPath(source, path))
  }

  return result
}

/**
 * Выполняет глубокую проверку равенства для примитивов, массивов и plain object.
 *
 * @param left Левое значение.
 * @param right Правое значение.
 * @returns `true`, если значения эквивалентны по структуре и данным.
 */
export const isEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) {
    return true
  }

  if (typeof left !== typeof right) {
    return false
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false
    }

    for (let index = 0; index < left.length; index += 1) {
      if (!isEqual(left[index], right[index])) {
        return false
      }
    }

    return true
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)
    if (leftKeys.length !== rightKeys.length) {
      return false
    }

    for (const key of leftKeys) {
      if (!isEqual(left[key], right[key])) {
        return false
      }
    }

    return true
  }

  return false
}
