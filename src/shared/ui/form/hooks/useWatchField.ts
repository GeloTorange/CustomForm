import { type Path, useFormContext, useWatch } from 'react-hook-form'

import type { FormValues } from '@/shared/lib/form/types'

type RHFFormValues<TValues extends FormValues> = TValues & Record<string, unknown>

/**
 * Подписывается на конкретное поле формы и возвращает его текущее значение.
 *
 * @template TValues Тип объекта значений формы.
 * @param name Путь до поля в dot-notation.
 * @returns Текущее значение поля.
 */
export const useWatchField = <TValues extends FormValues = FormValues>(
  name: string,
): unknown => {
  const { control } = useFormContext<RHFFormValues<TValues>>()
  return useWatch({
    control,
    name: name as Path<RHFFormValues<TValues>>,
  })
}
