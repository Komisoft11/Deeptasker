import dayjs from 'dayjs'
import { INotificationMessage } from '@/entities/Notifications/model/types/NotificationMessage.interface'
import { DATE_FORMAT } from '@/shared/const/date_format'

export function useGroupedNotifications(notifications: INotificationMessage[]) {
  const createReferenceDates = () => {
    const today = dayjs().startOf('day')
    const yesterday = today.subtract(1, 'day')
    return { today, yesterday }
  }

  const { today, yesterday } = createReferenceDates()

  const formatDateForDisplay = (date: dayjs.Dayjs) => {
    if (date.isSame(today, 'day')) return 'Today'
    if (date.isSame(yesterday, 'day')) return 'Yesterday'
    return date.format(DATE_FORMAT)
  }

  const groupedByDate = notifications.reduce<
    Record<string, INotificationMessage[]>
  >((acc, notification) => {
    const date = dayjs(notification.dateCreated)
    const dateKey = formatDateForDisplay(date)

    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(notification)

    return acc
  }, {})

  return Object.entries(groupedByDate)
    .map(([date, notifications], index) => ({
      date,
      notifications,
      index
    }))
    .sort((a, b) => {
      if (a.date === 'Today') return -1
      if (b.date === 'Today') return 1
      if (a.date === 'Yesterday') return -1
      if (b.date === 'Yesterday') return 1

      const dateA = dayjs(a.date, DATE_FORMAT)
      const dateB = dayjs(b.date, DATE_FORMAT)

      return dateB.diff(dateA)
    })
}
