import { useEffect, useState } from 'react'

function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delayMs])

  return debouncedValue
}

export default useDebounce
