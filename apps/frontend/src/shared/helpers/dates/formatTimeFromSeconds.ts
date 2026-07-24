export const formatTimeFromSeconds = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  let result = ''

  if (hours > 0) {
    result += `${hours}ч `
  }

  if (minutes > 0) {
    result += `${minutes}мин `
  }

  if (seconds > 0) {
    result += `${seconds}сек`
  }

  return result.trim()
}
