import * as React from 'react'

/**
 *
 * @param ref A ref callback or ref object. If anything falsy, this is a no-op.
 * @param element
 */

export function setRef<T>(element: T, ref?: React.Ref<T>): void {
  if (ref) {
    if (typeof ref === 'function') {
      ref(element)
    } else {
      ;(ref as React.MutableRefObject<T>).current = element
    }
  }
}
