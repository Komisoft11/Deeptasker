import { INotificationMessage } from '@/entities/Notifications'
import axios from '@/shared/api/interceptors'

const getNotificationsUrl = (path: string, isRead = false): string => {
  let url = `/notifications`
  if (isRead) {
    url += '/read'
  }
  return `${url}${path}`
}

export const NotificationsService = {
  async getNotifications(): Promise<INotificationMessage[]> {
    return (await axios.get(getNotificationsUrl(''))).data
  },

  async getNotificationsCount(): Promise<number> {
    return (await axios.get(getNotificationsUrl('/count-unread'))).data
  },

  async readAllNotifications(): Promise<INotificationMessage[]> {
    return (await axios.post(getNotificationsUrl('/all', true))).data
  },

  async readNotification(uuid: string): Promise<void> {
    return (await axios.post(getNotificationsUrl(`/${uuid}`, true))).data
  },

  async deleteNotification(uuid: string): Promise<void> {
    return (await axios.post(getNotificationsUrl(`/delete/${uuid}`))).data
  },

  async undeleteNotification(uuid: string): Promise<void> {
    return (await axios.post(getNotificationsUrl(`/undelete/${uuid}`))).data
  },

  async deleteAll(): Promise<void> {
    return (await axios.delete(getNotificationsUrl(`/delete-all`))).data
  }
}