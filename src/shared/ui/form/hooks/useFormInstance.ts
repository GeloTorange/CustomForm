import { useContext } from 'react'

import type { FormInstance, FormValues } from '@/shared/lib/form/types'
import { FormContext } from '@/shared/ui/form/model/FormContext'

// Возвращает текущий form instance из контекста формы.
export const useFormInstance = <TValues extends FormValues = FormValues>(): FormInstance<TValues> => {
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('useFormInstance должен вызываться внутри <Form>.')
  }

  return form as FormInstance<TValues>
}
