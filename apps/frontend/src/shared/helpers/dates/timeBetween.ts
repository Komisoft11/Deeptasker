import dayjs from 'dayjs'

export function secondsBetween(
  date1: dayjs.ConfigType,
  date2?: dayjs.ConfigType
): number {
  if (!date2) {
    return Math.abs(dayjs().diff(date1, 'seconds'))
  }

  return Math.abs(dayjs(date1).diff(date2, 'seconds'))
}
