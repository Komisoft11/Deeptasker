import dayjs from 'dayjs'

export function convertDateToString(date: Date): string {
  return dayjs(date).toISOString()
}
