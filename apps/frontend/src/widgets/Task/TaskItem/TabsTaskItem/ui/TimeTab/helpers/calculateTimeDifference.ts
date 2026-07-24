export const calculateTimeDifference = (start: Date, end: Date): string => {
  const differenceInMilliseconds = end.getTime() - start.getTime()

  const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60))
  const minutes = Math.floor(
    (differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
  )
  const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000)

  const parts = []
  if (hours > 0) parts.push(`${hours}ч`)
  if (minutes > 0) parts.push(`${minutes}мин`)
  if (seconds > 0) parts.push(`${seconds}сек`)

  return parts.join(' ')
}

export const calculateTimeDifferenceInSeconds = (
  start: Date,
  end: Date
): number => {
  const differenceInMilliseconds = end.getTime() - start.getTime()

  return Math.floor(differenceInMilliseconds / 1000)
}
