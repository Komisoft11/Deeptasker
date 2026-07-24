import { useCallback, useEffect, useState } from 'react'

export const useVerificationTimer = (initialTime = 120) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isTimerDone, setIsTimerDone] = useState(false)

  useEffect(() => {
    if (isTimerDone) {
      return
    }

    if (timeLeft <= 0) {
      setIsTimerDone(true)
      return
    }

    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timerId)
  }, [timeLeft, isTimerDone])

  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime)
    setIsTimerDone(false)
  }, [initialTime])

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secondsLeft = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secondsLeft
      .toString()
      .padStart(2, '0')}`
  }, [])

  return { timeLeft, isTimerDone, resetTimer, formatTime }
}
