import type { ButtonHTMLAttributes } from 'react'

import { clsx } from 'clsx'
import '@/shared/ui/third-party-kit/styles/third-party-kit.css'

type ButtonVariant = 'primary' | 'secondary'

export interface ThirdPartyButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  className?: string
  variant?: ButtonVariant
}

// Кнопка "стороннего UI kit" для демонстрации интеграции с Form.Item.
export const ThirdPartyButton = ({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ThirdPartyButtonProps) => (
  <button
    type={type}
    className={clsx('kit-button', `kit-button--${variant}`, className)}
    {...props}
  />
)
