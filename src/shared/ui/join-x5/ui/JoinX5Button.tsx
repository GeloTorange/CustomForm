import type { ThirdPartyButtonProps } from '@/shared/ui/third-party-kit'
import { ThirdPartyButton } from '@/shared/ui/third-party-kit'

/**
 * Пропсы `JoinX5Button`.
 */
export type JoinX5ButtonProps = ThirdPartyButtonProps

/**
 * Адаптер кнопки из join-x5.
 * Сейчас используется внутренняя реализация, чтобы сохранить стабильный API.
 *
 * @param props Пропсы кнопки.
 * @returns JSX-элемент action-кнопки.
 */
export const JoinX5Button = (props: JoinX5ButtonProps) => (
  <ThirdPartyButton {...props} />
)

