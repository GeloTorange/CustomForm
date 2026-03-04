import type { FormValues } from '@/shared/lib/form/types'
import { useFormInstance } from '@/shared/ui/form/hooks/useFormInstance'
import { useWatchField } from '@/shared/ui/form/hooks/useWatchField'
import { FormItem } from '@/shared/ui/form/ui/FormItem'
import { FormRoot } from '@/shared/ui/form/ui/Form'

type FormComponent = typeof FormRoot & {
  Item: typeof FormItem
  useFormInstance: typeof useFormInstance
  useWatchField: typeof useWatchField
}

/**
 * Публичный API формы в стиле Antd.
 *
 * Содержит:
 * - `Form` (корневой компонент),
 * - `Form.Item` (элемент поля/контейнер),
 * - `Form.useFormInstance` (доступ к form instance),
 * - `Form.useWatchField` (подписка на значение поля).
 */
export const Form = Object.assign(FormRoot, {
  Item: FormItem,
  useFormInstance,
  useWatchField,
}) as FormComponent

export type {
  FormFieldData,
  FormFinishFailed,
  FormInstance,
  FormItemProps,
  FormItemRenderProps,
  FormLayout,
  FormProps,
  FormValidateTrigger,
  FormValues,
  RegisterFieldOptions,
  SetFieldValueOptions,
  ValidationRule,
} from '@/shared/lib/form/types'

export type AnyFormValues = FormValues
