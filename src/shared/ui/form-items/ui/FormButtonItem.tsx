import type { ReactNode } from 'react'

import type { FormItemProps, FormValues } from '@/shared/lib/form/types'
import { Form } from '@/shared/ui/form'
import type { JoinX5ButtonProps } from '@/shared/ui/join-x5'
import { JoinX5Button } from '@/shared/ui/join-x5'

/**
 * Свойства универсального FormItem для action-кнопок.
 * Такой элемент не привязан к конкретному полю формы и используется как layout/action wrapper.
 *
 * @template TValues Тип полного объекта значений формы.
 */
export interface FormButtonItemProps<
  TValues extends FormValues = FormValues,
> extends Omit<
    FormItemProps<TValues>,
    'children' | 'name' | 'rules' | 'normalize' | 'valuePropName' | 'trigger' | 'getValueFromEvent'
  > {
  /**
   * Пропсы для `JoinX5Button`, который используется внутри компонента.
   * Контент кнопки передаётся через `children` текущего компонента.
   */
  buttonProps?: Omit<JoinX5ButtonProps, 'children'>
  /**
   * Контент кнопки.
   */
  children: ReactNode
}

/**
 * Универсальная обёртка над `Form.Item` для action-кнопок из сторонних UI kit.
 *
 * @template TValues Тип полного объекта значений формы.
 * @param props Свойства FormItem и `JoinX5Button`.
 * @returns JSX-элемент action-кнопки в обвязке FormItem.
 */
export const FormButtonItem = <
  TValues extends FormValues = FormValues,
>({
  buttonProps,
  children,
  ...itemProps
}: FormButtonItemProps<TValues>) => (
  <Form.Item<TValues> {...itemProps}>
    <JoinX5Button {...buttonProps}>{children}</JoinX5Button>
  </Form.Item>
)
