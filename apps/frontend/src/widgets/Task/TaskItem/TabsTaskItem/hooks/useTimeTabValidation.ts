import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import utc from 'dayjs/plugin/utc'
import { useTimeHistory } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/hooks/useTimeHistory'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

dayjs.extend(utc)
dayjs.extend(isSameOrAfter)

export const useTimeTabValidation = () => {
  const {
    taskStore: { activeTask }
  } = useRootStore()
  const { timeHistory } = useTimeHistory(activeTask)

  const parseDate = (value: string | Date | null) => {
    if (!value) return null
    if (value instanceof Date) return dayjs.utc(value)

    const formats = ['DD.MM.YYYY, HH:mm:ss', 'YYYY-MM-DD HH:mm:ss']
    for (const fmt of formats) {
      const date = dayjs.utc(value, fmt, true)
      if (date.isValid()) return date
    }

    return null
  }

  const isBeforeDateCreated = (value: string) => {
    const taskCreationDate = parseDate(activeTask.dateCreated)
    const inputDate = parseDate(value)
    if (!taskCreationDate || !inputDate) return false

    return !inputDate.isBefore(taskCreationDate)
  }

  const isAfterNow = (value: string | Date) => {
    const now = dayjs().utcOffset(0, true)
    const inputDate = parseDate(value)

    if (!inputDate) return false
    return !inputDate.isAfter(now)
  }

  const isBeforeStartDate = (value: string, startDateInput: string) => {
    const startDate = parseDate(startDateInput)
    const endDate = parseDate(value)
    if (!startDate || !endDate) return false

    return endDate.isSameOrAfter(startDate)
  }

  const isTimeExist = (
    startDate: string,
    endDate: string,
    editingId?: number
  ) => {
    const startDateInput = parseDate(startDate)
    const endDateInput = parseDate(endDate)
    if (!startDateInput || !endDateInput) return false

    return timeHistory.some((period) => {
      if (period.id === editingId) return false

      const periodStart = parseDate(period.startTime)
      const periodEnd = parseDate(period.endTime)
      if (!periodStart || !periodEnd) return false

      return (
        startDateInput.isBefore(periodEnd) && endDateInput.isAfter(periodStart)
      )
    })
  }

  return { isBeforeDateCreated, isAfterNow, isBeforeStartDate, isTimeExist }
}