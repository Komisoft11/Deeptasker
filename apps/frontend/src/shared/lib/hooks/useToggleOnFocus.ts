import { useMemo, useState } from 'react'

interface IEvents {
  onFocus: (event?: React.FocusEvent<HTMLElement>) => void
  onBlur: (event?: React.FocusEvent<HTMLElement>) => void
}

export const useToggleOnFocus = (initialState = false): [boolean, IEvents] => {
  const [show, toggle] = useState<boolean>(initialState)

  const eventHandlers = useMemo<IEvents>(
    () => ({
      onFocus: () => toggle(true),
      onBlur: () => toggle(false)
    }),
    []
  )

  return [show, eventHandlers]
}
