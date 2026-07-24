import dayjs from 'dayjs'

export function transformTimestampToDate(timestamp: number): Date {
  return dayjs(timestamp).toDate()
}
