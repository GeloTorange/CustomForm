import type { HTMLAttributes } from 'react'

import { clsx } from 'clsx'
import '@/shared/ui/third-party-kit/styles/third-party-kit.css'

export interface ThirdPartyToggleProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange' | 'className'> {
  checked?: boolean
  className?: string
  onCheckedChange?: (nextValue: boolean) => void
}

// Переключатель с нестандартным событием onCheckedChange.
export const ThirdPartyToggle = ({
  checked = false,
  className,
  onCheckedChange,
  ...props
}: ThirdPartyToggleProps) => (
  <button
    {...props}
    type="button"
    role="switch"
    aria-checked={checked}
    className={clsx('kit-toggle', checked && 'kit-toggle--checked', className)}
    // По клику переключаем состояние и отдаём следующее значение наружу.
    onClick={() => onCheckedChange?.(!checked)}
  >
    <span className="kit-toggle__track" aria-hidden>
      <span className="kit-toggle__thumb" />
    </span>
    <span className="kit-toggle__label">{checked ? 'Да' : 'Нет'}</span>
  </button>
)
