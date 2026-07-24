import dayjs from 'dayjs'

export function getCurrentTimestamp() {
  return dayjs().valueOf()
}
