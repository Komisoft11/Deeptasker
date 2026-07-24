import { QueryClient } from '@tanstack/query-core'
import { notificationQueries } from '@/entities/Notifications/api/notification'
import {
  IMessageExecutor,
  INotificationMessage
} from '@/entities/lib/components/web_socket/message_executors/types/message-executor.interface'

const MEMBER_TYPE = {
  ADD: 'add',
  REMOVE: 'remove',
  UPDATE_PERMISSIONS: 'updatePermissions'
}

export class SubscribeNotificationMessageExecutor implements IMessageExecutor {
  private readonly queryClient: QueryClient | null = null

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
  }

  async execute(event: MessageEvent): Promise<void> {
    const notificationMessage = JSON.parse(event.data) as INotificationMessage

    const { notification, userId } = notificationMessage
    const qc = this.queryClient

    if (!qc) return

    if (notification.create) {
      qc.setQueryData<number>(
        notificationQueries.count().queryKey,
        (old) => (old ?? 0) + 1
      )
    }
  }
}