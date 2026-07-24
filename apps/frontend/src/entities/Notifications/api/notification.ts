import { createQueryKeys } from '@lukemorales/query-key-factory'
import { NotificationsService } from '@/entities/Notifications'

export const notificationQueries = createQueryKeys('notifications', {
  list: () => ({
    queryKey: ['notifications'],
    queryFn: NotificationsService.getNotifications
  }),
  count: () => ({
    queryKey: ['notifications', 'count'],
    queryFn: NotificationsService.getNotificationsCount
  })
})
