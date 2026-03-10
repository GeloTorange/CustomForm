import type { ChangeEvent, InputHTMLAttributes } from 'react'

import { clsx } from 'clsx'
import '@/shared/ui/third-party-kit/styles/third-party-kit.css'

export interface ThirdPartyTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string
  /**
   * Стандартный контролируемый проп в стиле большинства UI kit.
   */
  value?: string
  /**
   * Стандартный обработчик изменения в стиле большинства UI kit.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  /**
   * Альтернативный проп для обратной совместимости с нестандартным API.
   */
  modelValue?: string
  /**
   * Альтернативный обработчик для обратной совместимости с нестандартным API.
   */
  onValueChange?: (value: string) => void
}

// Инпут стороннего UI kit.
// Поддерживает и стандартный API (`value/onChange`), и нестандартный (`modelValue/onValueChange`).
export const ThirdPartyTextField = ({
  className,
  value,
  onChange,
  modelValue,
  onValueChange,
  ...props
}: ThirdPartyTextFieldProps) => {
  // Приоритет у стандартного `value`, чтобы компонент вёл себя ожидаемо для join-x5-подобных контролов.
  const resolvedValue = value ?? modelValue ?? ''

  return (
    <input
      {...props}
      value={resolvedValue}
      onChange={(event) => {
        // Вызываем оба обработчика: стандартный и legacy-обработчик для совместимости.
        onChange?.(event)
        onValueChange?.(event.target.value)
      }}
      className={clsx('kit-text-field', className)}
    />
  )
}
