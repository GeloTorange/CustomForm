import type { ReactNode } from 'react'

export type FormValues = object

export type FormLayout = 'vertical' | 'horizontal'

export type FormValidateTrigger = 'onChange' | 'onBlur' | 'onSubmit'

export interface ValidationRule<TValues extends FormValues = FormValues> {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
  validator?: (value: unknown, values: TValues) => string | void | Promise<string | void>
}

export interface FormFieldData<TValues extends FormValues = FormValues> {
  name: string
  value: unknown
  touched: boolean
  errors: string[]
  values: TValues
}

export interface FormFinishFailed<TValues extends FormValues = FormValues> {
  values: TValues
  errorFields: FormFieldData<TValues>[]
}

export interface SetFieldValueOptions {
  touch?: boolean
  validate?: boolean
  trigger?: FormValidateTrigger
}

export interface RegisterFieldOptions<TValues extends FormValues = FormValues> {
  rules?: ValidationRule<TValues>[]
  validateTrigger?: FormValidateTrigger | FormValidateTrigger[]
}

export interface FormInstance<TValues extends FormValues = FormValues> {
  getFieldValue: (name: string) => unknown
  getFieldsValue: () => TValues
  getFieldError: (name: string) => string[]
  getFieldsError: (names?: string[]) => FormFieldData<TValues>[]
  isFieldTouched: (name: string) => boolean
  isFieldsTouched: (names?: string[]) => boolean
  setFieldValue: (
    name: string,
    value: unknown,
    options?: SetFieldValueOptions,
  ) => Promise<void>
  setFieldsValue: (values: Partial<TValues>) => Promise<void>
  resetFields: (names?: string[]) => void
  validateFields: (names?: string[]) => Promise<TValues>
  submit: () => Promise<void>
  registerField: (name: string, options?: RegisterFieldOptions<TValues>) => void
  unregisterField: (name: string) => void
  markFieldTouched: (name: string, trigger?: FormValidateTrigger) => Promise<void>
}

export interface FormProps<TValues extends FormValues = FormValues> {
  children: ReactNode
  className?: string
  layout?: FormLayout
  initialValues?: Partial<TValues>
  onFinish?: (values: TValues) => void | Promise<void>
  onFinishFailed?: (payload: FormFinishFailed<TValues>) => void | Promise<void>
  onValuesChange?: (changedValues: Partial<TValues>, allValues: TValues) => void
  onFieldsChange?: (
    changedFields: FormFieldData<TValues>[],
    allFields: FormFieldData<TValues>[],
  ) => void
}

export interface FormItemRenderProps<TValues extends FormValues = FormValues> {
  name?: string
  value: unknown
  errors: string[]
  touched: boolean
  onChange: (...args: unknown[]) => void
  onBlur: (...args: unknown[]) => void
  form: FormInstance<TValues>
}

export interface FormItemProps<TValues extends FormValues = FormValues> {
  name?: string
  label?: ReactNode
  className?: string
  help?: ReactNode
  noStyle?: boolean
  valuePropName?: string
  trigger?: string
  validateTrigger?: FormValidateTrigger | FormValidateTrigger[]
  getValueFromEvent?: (...args: unknown[]) => unknown
  normalize?: (value: unknown, previousValue: unknown, allValues: TValues) => unknown
  rules?: ValidationRule<TValues>[]
  children: ReactNode | ((props: FormItemRenderProps<TValues>) => ReactNode)
}
