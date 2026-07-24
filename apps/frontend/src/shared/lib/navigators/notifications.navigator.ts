import { NOTIFICATIONS_URL } from '@/shared/config/route.config'

export const NotificationsNavigator = {
  getNotificationsUrl(): string {
    return NOTIFICATIONS_URL
  }
} as const
