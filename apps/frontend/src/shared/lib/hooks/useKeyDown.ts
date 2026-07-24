import React, { useEffect } from 'react'

export const useKeyDown = (
  ref: React.MutableRefObject<HTMLElement | null> | Document,
  callback: () => void,
  keyCombinations: string[]
) => {
  const onKeyDown = (event: KeyboardEvent) => {
    const pressedKeys: string[] = []

    if (event.ctrlKey) {
      pressedKeys.push('Ctrl')
    }
    if (event.altKey) {
      pressedKeys.push('Alt')
    }
    if (event.shiftKey) {
      pressedKeys.push('Shift')
    }

    pressedKeys.push(event.code)

    const combination = pressedKeys.join('+')

    if (keyCombinations.includes(combination)) {
      event.preventDefault()
      callback()
    }
  }

  useEffect(() => {
    const element = ref instanceof Document ? ref.documentElement : ref.current

    if (!element) {
      return
    }

    element.addEventListener('keydown', onKeyDown)
    return () => {
      element.removeEventListener('keydown', onKeyDown)
    }
  }, [callback, keyCombinations])
}
