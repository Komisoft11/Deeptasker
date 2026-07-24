import dayjs from 'dayjs'

export function getCurrentUTCDateTime(): Date {
  return dayjs().toDate()
}

export function getCurrentUTCDate(): Date {
  return new Date(new Date().setUTCHours(0, 0, 0, 0))
}

export function transformToUTCDateTime(entity: dayjs.ConfigType): Date {
  return new Date(dayjs(entity).toDate().toUTCString())
}

export function transformLocaleDateToDateWithoutTimeZone(date: Date): Date {
  const offset = date.getTimezoneOffset()
  date.setUTCMinutes(-offset)
  return date
}
