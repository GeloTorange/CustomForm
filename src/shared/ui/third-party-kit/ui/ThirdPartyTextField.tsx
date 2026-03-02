import type { InputHTMLAttributes } from 'react'

import { clsx } from 'clsx'
import '@/shared/ui/third-party-kit/styles/third-party-kit.css'

export interface ThirdPartyTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'className'> {
  className?: string
  modelValue?: string
  onValueChange?: (value: string) => void
}

// Инпут с нестандартным API (modelValue/onValueChange) как у внешних библиотек.
export const ThirdPartyTextField = ({
  className,
  modelValue = '',
  onValueChange,
  ...props
}: ThirdPartyTextFieldProps) => (
  <input
    {...props}
    value={modelValue}
    // Транслируем нативное событие в API onValueChange(value).
    onChange={(event) => onValueChange?.(event.target.value)}
    className={clsx('kit-text-field', className)}
  />
)
