import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react'
import useEnhancedEffect from './useEnhancedEffect'

interface EventListenerHandle {
  add: (el: HTMLElement | Document | Window) => void
  remove: () => void
}

function useEventListener<K extends keyof GlobalEventHandlersEventMap>(
  eventName: K,
  handler:
    | false
    | null
    | undefined
    | ((event: GlobalEventHandlersEventMap[K]) => void),
  element?: undefined,
  options?: AddEventListenerOptions
): EventListenerHandle

function useEventListener<E extends Event>(
  event: string,
  handler: false | null | undefined | ((ev: E) => void),
  options?: AddEventListenerOptions
): EventListenerHandle

function useEventListener<
  E extends Event,
  K extends keyof GlobalEventHandlersEventMap
>(
  eventName: string | K,
  handler: false | null | undefined | ((ev: E) => void),
  options?: AddEventListenerOptions
): EventListenerHandle {
  // Create a ref that stores handler

  const cbRef = useRef(handler)

  useEnhancedEffect(() => {
    cbRef.current = handler
  }, [handler])

  const noop = () => {}

  const cb = useCallback((e: any) => cbRef.current && cbRef.current(e), [])

  const detach = useRef(noop)
  const remove = useCallback(() => {
    detach.current()
    detach.current = noop
  }, [])

  const add = useCallback(
    (el: HTMLElement | Document | Window) => {
      remove()
      if (!el) {
        return
      }

      el.addEventListener(eventName, cb, options)
      detach.current = () => el.removeEventListener(eventName, cb, options)
    },
    [options, cb, eventName, remove]
  )

  useEffect(() => remove, [remove])

  return useMemo(() => ({ add, remove }), [add, remove])
}

function useEventListenerLol<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  KM extends keyof MediaQueryListEventMap,
  T extends HTMLElement | MediaQueryList | void = void
>(
  eventName: KW | KH | KM,
  handler: (
    event:
      | WindowEventMap[KW]
      | HTMLElementEventMap[KH]
      | MediaQueryListEventMap[KM]
      | Event
  ) => void,
  element?: RefObject<T>,
  options?: boolean | AddEventListenerOptions
) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler)

  useEnhancedEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current ?? window

    if (!(targetElement && targetElement.addEventListener)) return

    // Create event listener that calls handler function stored in ref
    const listener: typeof handler = (event) => savedHandler.current(event)

    targetElement.addEventListener(eventName, listener, options)

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, listener, options)
    }
  }, [eventName, element, options])
}

export { useEventListener, useEventListenerLol }
