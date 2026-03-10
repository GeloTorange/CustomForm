import type { FormItemProps, FormValues } from '@/shared/lib/form/types'
import { Form } from '@/shared/ui/form'
import type { JoinX5InputProps } from '@/shared/ui/join-x5'
import { JoinX5Input } from '@/shared/ui/join-x5'

/**
 * Свойства универсального переиспользуемого FormItem для input-подобных контролов.
 *
 * @template TValues Тип полного объекта значений формы.
 */
export interface FormInputItemProps<
  TValues extends FormValues = FormValues,
> extends Omit<FormItemProps<TValues>, 'children' | 'valuePropName' | 'trigger' | 'getValueFromEvent'> {
  /**
   * Пропсы для `JoinX5Input`, который используется внутри компонента.
   * `value/onChange/name` не передаются вручную, их инжектит `Form.Item`.
   */
  inputProps?: Omit<JoinX5InputProps, 'value' | 'onChange' | 'name'>
}

/**
 * Универсальная обёртка над `Form.Item` для сторонних input-компонентов
 * со стандартным контрактом `value/onChange`.
 *
 * @template TValues Тип полного объекта значений формы.
 * @param props Свойства FormItem и `JoinX5Input`.
 * @returns JSX-элемент, готовый для повторного использования в разных формах.
 */
export const FormInputItem = <
  TValues extends FormValues = FormValues,
>({
  inputProps,
  ...itemProps
}: FormInputItemProps<TValues>) => (
  <Form.Item<TValues> {...itemProps}>
    {/* Базовое значение нужно для контракта join-x5; Form.Item переопределит его фактическим значением поля. */}
    <JoinX5Input value="" {...inputProps} />
  </Form.Item>
)
