import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import i18n from '@/shared/config/i18n/i18n'
import {
  FULL_TIME_FORMAT,
  SHORT_DAY_FORMAT,
  TIME_FORMAT,
  WITHOUT_YEAR_FORMAT
} from '@/shared/const/date_format'

interface Props {
  date: string | Date
  includeTime?: boolean
  includeSeconds?: boolean
}

export const formatDateTime = ({
  date,
  includeTime = true,
  includeSeconds = false
}: Props): string => {
  const currentLang = i18n.language || 'ru'
  const dayjsDate = dayjs(date).locale(currentLang)

  if (!dayjsDate.isValid()) {
    throw new Error('Invalid date')
  }

  const currentYear = dayjs().year()
  const dateYear = dayjsDate.year()

  const dateFormat =
    dateYear !== currentYear ? SHORT_DAY_FORMAT : WITHOUT_YEAR_FORMAT
  const timeFormat = includeSeconds ? FULL_TIME_FORMAT : TIME_FORMAT

  const formattedDate = dayjsDate.format(dateFormat)
  const formattedTime = dayjsDate.format(timeFormat)

  if (!includeTime) {
    return formattedDate
  }

  return `${formattedDate} · ${formattedTime}`
}
