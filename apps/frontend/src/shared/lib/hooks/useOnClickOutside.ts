import { RefObject } from 'react'
import { useEventListenerLol } from './useEventListener'


type Handler = (event: MouseEvent) => void

function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): void {
  useEventListenerLol(mouseEvent, (event) => {
    const el = ref?.current

    if (!el || el.contains(event.target as Node)) {
      return
    }

    // @ts-ignore
    handler(event)
  })
}

export default useOnClickOutside
