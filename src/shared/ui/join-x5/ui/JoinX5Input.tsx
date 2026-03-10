import type { ThirdPartyTextFieldProps } from '@/shared/ui/third-party-kit'
import { ThirdPartyTextField } from '@/shared/ui/third-party-kit'

/**
 * Пропсы `JoinX5Input`.
 * По контракту join-x5 `value` является обязательным.
 */
export type JoinX5InputProps = Omit<ThirdPartyTextFieldProps, 'value'> & {
  value: string
}

/**
 * Адаптер input-компонента из join-x5.
 * Сейчас используется внутренняя реализация, чтобы сохранить стабильный API.
 *
 * @param props Пропсы input-компонента.
 * @returns JSX-элемент input-контрола.
 */
export const JoinX5Input = (props: JoinX5InputProps) => (
  <ThirdPartyTextField {...props} />
)
