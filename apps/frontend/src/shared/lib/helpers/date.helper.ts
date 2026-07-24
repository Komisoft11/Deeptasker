import {
  endOfISOWeek,
  format,
  getISOWeek,
  isValid,
  parse,
  setISOWeek,
  startOfISOWeek
} from 'date-fns'
import dayjs from 'dayjs'

export const getWeekNumber = (date: Date): number => {
  const firstDayOfTheYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear =
    (date.getTime() - firstDayOfTheYear.getTime()) / 86400000

  return Math.ceil((pastDaysOfYear + firstDayOfTheYear.getDay() + 1) / 7)
}

interface CreateDateParams {
  locale?: string
  date?: Date
}

export interface ICreateDate {
  date: Date
  dayNumber: number
  day: string
  dayNumberInWeek: number
  dayShort: string
  year: number
  yearShort: string
  month: string
  monthShort: string
  monthNumber: number
  monthIndex: number
  timestamp: number
  week: number
}

export const createDate = (params?: CreateDateParams): ICreateDate => {
  const locale = params?.locale ?? 'default'

  const d = params?.date ?? new Date()
  const dayNumber = d.getDate()
  const day = d.toLocaleDateString(locale, { weekday: 'long' })
  const dayNumberInWeek = d.getDay() + 1
  const dayShort = d.toLocaleDateString(locale, { weekday: 'short' })
  const year = d.getFullYear()
  const yearShort = d.toLocaleDateString(locale, { year: '2-digit' })
  const month = d.toLocaleDateString(locale, { month: 'long' })
  const monthShort = d.toLocaleDateString(locale, { month: 'short' })
  const monthNumber = d.getMonth() + 1
  const monthIndex = d.getMonth()
  const timestamp = d.getTime()
  const week = getWeekNumber(d)

  return {
    date: d,
    dayNumber,
    day,
    dayNumberInWeek,
    dayShort,
    year,
    yearShort,
    month,
    monthShort,
    monthNumber,
    monthIndex,
    timestamp,
    week
  }
}

interface CreateMonthParams {
  date?: Date
  locale?: string
}

export interface ICreateMonth {
  getDay: (dayNumber: number) => ICreateDate
  monthName: string
  monthIndex: number
  monthNumber: number
  year: number
  createMonthDays: () => ICreateDate[]
}

export const createMonth = (params?: CreateMonthParams): ICreateMonth => {
  const date = params?.date ?? new Date()
  const locale = params?.locale ?? 'default'

  const d = createDate({ date, locale })
  const { month: monthName, year, monthNumber, monthIndex } = d

  const getDay = (dayNumber: number): ICreateDate =>
    createDate({ date: new Date(year, monthIndex, dayNumber), locale })

  const createMonthDays = (): ICreateDate[] => {
    const days = []

    for (let i = 0; i <= getMonthNumberOfDays(monthIndex, year) - 1; i += 1) {
      days[i] = getDay(i + 1)
    }

    return days
  }

  return {
    getDay,
    monthName,
    monthIndex,
    monthNumber,
    year,
    createMonthDays
  }
}

interface CreateYearParams {
  year?: number
  locale?: string
  monthNumber?: number
}

export interface IMonthsNames {
  month: ReturnType<typeof createDate>['month']
  monthShort: ReturnType<typeof createDate>['monthShort']
  monthIndex: ReturnType<typeof createDate>['monthIndex']
  date: ReturnType<typeof createDate>['date']
}

export const getMonthsNames = (locale: string = 'default'): IMonthsNames[] => {
  const monthsNames: IMonthsNames[] = Array.from({ length: 12 })

  const d = new Date()

  monthsNames.forEach((_, i) => {
    const { month, monthIndex, monthShort, date } = createDate({
      locale,
      date: new Date(d.getFullYear(), d.getMonth() + i, 1)
    })

    monthsNames[monthIndex] = { month, monthIndex, monthShort, date }
  })

  return monthsNames
}

export interface IWeekDaysNames {
  day: ReturnType<typeof createDate>['day']
  dayShort: ReturnType<typeof createDate>['dayShort']
}

export const getWeekDaysNames = (
  firstWeekDay: number = 4,
  locale: string = 'default'
): IWeekDaysNames[] => {
  const weekDaysNames: IWeekDaysNames[] = Array.from({ length: 7 })

  const date = new Date()

  weekDaysNames.forEach((_, i) => {
    const { day, dayNumberInWeek, dayShort } = createDate({
      locale,
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate() + i)
    })

    weekDaysNames[dayNumberInWeek - 1] = { day, dayShort }
  })

  return [
    ...weekDaysNames.slice(firstWeekDay - 1),
    ...weekDaysNames.slice(0, firstWeekDay - 1)
  ]
}

export const getMonthNumberOfDays = (
  monthIndex: number,
  yearNumber: number = new Date().getFullYear()
): number => {
  return new Date(yearNumber, monthIndex + 1, 0).getDate()
}

/**
 * @Example isValidDate('2023-02-29', 'yyyy-MM-dd') // false
 * @Example isValidDate('2023-02-28', 'yyyy-MM-dd') // true
 * @param dateString
 * @param formatString
 */
export const isValidDate = (
  dateString: string,
  formatString: string
): boolean => {
  // Парсим дату из строки в указанный формат
  const parsedDate = parse(dateString, formatString, new Date())

  if (!isValid(parsedDate)) {
    return false
  }

  return dateString === format(parsedDate, formatString)
}

export const todayDate: Date = new Date()

const getTomorrowDate = (): Date => {
  const tomorrow = new Date(todayDate)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

export const tomorrowDate: Date = getTomorrowDate()

export const isLastWeek = (date: Date): boolean => {
  const startOfThisWeek = startOfISOWeek(new Date())
  const endOfThisWeek = endOfISOWeek(new Date())

  const startDateOfLastWeek = setISOWeek(
    startOfThisWeek,
    getISOWeek(todayDate) - 1
  )
  const endDateOfLastWeek = setISOWeek(endOfThisWeek, getISOWeek(todayDate) - 1)

  return (
    dayjs(date).isAfter(startDateOfLastWeek) &&
    dayjs(date).isBefore(endDateOfLastWeek)
  )
}

export const isMoreThenLastWeek = (date: Date): boolean => {
  const startOfThisWeek = startOfISOWeek(new Date())

  return dayjs(date).isBefore(startOfThisWeek)
}

export const isCurrentYear = (date: Date | string): boolean => {
  return dayjs(date).year() === dayjs().year()
}

export const getCurrentYear = (): number => dayjs().year()
