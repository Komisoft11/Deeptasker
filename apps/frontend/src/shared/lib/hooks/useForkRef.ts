import * as React from 'react'
import { setRef } from './setRef'

export default function useForkRef<Instance>(
  ...refs: Array<React.Ref<Instance> | undefined>
): React.RefCallback<Instance> | null {
  return React.useMemo(() => {
    if (refs.every((ref) => ref == null)) {
      return null
    }

    return (instance) => {
      refs.forEach((ref) => {
        setRef(instance, ref)
      })
    }
    // eslint-disabled-next-line react-hooks/exhaustive-deps
  }, refs)
}
