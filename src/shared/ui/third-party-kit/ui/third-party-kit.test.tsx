import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  ThirdPartyButton,
  ThirdPartyTextField,
  ThirdPartyToggle,
} from '@/shared/ui/third-party-kit'

describe('ThirdPartyButton', () => {
  it('рендерит variant и пробрасывает props', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(
      <ThirdPartyButton variant="secondary" onClick={onClick}>
        Click
      </ThirdPartyButton>,
    )

    const button = screen.getByRole('button', { name: 'Click' })
    expect(button).toHaveClass('kit-button--secondary')

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('ThirdPartyTextField', () => {
  it('вызывает onValueChange при вводе', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()

    const ControlledField = () => {
      const [value, setValue] = useState('')

      return (
        <ThirdPartyTextField
          modelValue={value}
          onValueChange={(next) => {
            onValueChange(next)
            setValue(next)
          }}
        />
      )
    }

    render(<ControlledField />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'abc')
    expect(onValueChange).toHaveBeenLastCalledWith('abc')
  })

  it('поддерживает стандартный value/onChange контракт', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    const ControlledField = () => {
      const [value, setValue] = useState('')

      return (
        <ThirdPartyTextField
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setValue(event.target.value)
          }}
        />
      )
    }

    render(<ControlledField />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'xyz')
    expect(onChange).toHaveBeenLastCalledWith('xyz')
  })
})

describe('ThirdPartyToggle', () => {
  it('переключает checked и вызывает onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    const user = userEvent.setup()

    render(<ThirdPartyToggle checked={false} onCheckedChange={onCheckedChange} />)
    const toggle = screen.getByRole('switch')

    await user.click(toggle)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})
