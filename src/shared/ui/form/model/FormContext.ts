import { createContext } from 'react'

import type { FormInstance, FormValues } from '@/shared/lib/form/types'

/**
 * Контекст с `FormInstance` для доступа к API формы из дочерних компонентов.
 */
export const FormContext = createContext<FormInstance<FormValues> | null>(null)
