import dayjs from 'dayjs'

export function formatDateWithoutTime(date: unknown): string {
  if (date instanceof Date) {
    return dayjs(date).toISOString()
  }

  throw new Error('Invalid date')
}
