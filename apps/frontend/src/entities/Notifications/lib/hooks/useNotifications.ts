import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UseMutationResult } from '@tanstack/react-query/src/types'
import { useState } from 'react'
import { INotificationMessage } from '@/entities/Notifications'
import { notificationQueries } from '@/entities/Notifications/api/notification'
import { NotificationsService } from '@/entities/Notifications/services/notifications.service'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface IReturn {
  notifications: INotificationMessage[]
  count: number
  deleteAsync: UseMutationResult<void, unknown, string>
  undeleteAsync: UseMutationResult<void, unknown, string>
  readAsync: UseMutationResult<void, unknown, { uuid: string }>
  readAllAsync: UseMutationResult<INotificationMessage[], unknown, void>
  deleteAllAsync: UseMutationResult<void, unknown, void>
  fetchNotifications: () => void
  isLoading: boolean
  refetch: () => void
}

export const useNotifications = (): IReturn => {
  const [localCount, setLocalCount] = useState<number | null>(null)

  const countData = useQuery(notificationQueries.count())
  const count = localCount !== null ? localCount : (countData.data as number)
  const queryClient = useQueryClient()

  const {
    data: list,
    refetch,
    isLoading
  } = useQuery({
    queryKey: notificationQueries.list().queryKey,
    queryFn: notificationQueries.list().queryFn
  })

  const notifications = list as INotificationMessage[]

  const deleteAsync = useCreateMutation<void, unknown, string>({
    mutationKey: ['delete notification'],
    mutationFn: NotificationsService.deleteNotification,
    onSuccess: (_, uuid) => {
      queryClient.setQueryData<INotificationMessage[]>(
        notificationQueries.list().queryKey,
        (oldData) =>
          oldData ? oldData.filter((item) => item.uuid !== uuid) : []
      )
    }
  })

  const undeleteAsync = useCreateMutation<void, unknown, string>({
    mutationKey: ['undelete notification'],
    mutationFn: NotificationsService.undeleteNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationQueries.list().queryKey
      })
    }
  })

  const readAsync = useCreateMutation<void, unknown, { uuid: string }>({
    mutationKey: ['read notification'],
    mutationFn: ({ uuid }) => NotificationsService.readNotification(uuid),
    onSuccess: (_, { uuid }) => {
      queryClient.setQueryData<INotificationMessage[]>(
        notificationQueries.list().queryKey,
        (old) =>
          old?.map((n) => (n.uuid === uuid ? { ...n, isRead: true } : n)) ?? []
      )
      setLocalCount((prev) => (prev !== null ? prev - 1 : count - 1))
    }
  })

  const readAllAsync = useCreateMutation<INotificationMessage[], unknown, void>(
    {
      mutationKey: ['read all notifications'],
      mutationFn: NotificationsService.readAllNotifications,
      onSuccess: () => {
        queryClient.setQueryData<INotificationMessage[]>(
          notificationQueries.list().queryKey,
          (old) => old?.map((n) => ({ ...n, isRead: true })) ?? []
        )
        setLocalCount(0)
      },
      onError: (error) => {
        console.error('Failed to mark all notifications as read:', error)
      }
    }
  )

  const deleteAllAsync = useCreateMutation<void, unknown, void>({
    mutationKey: ['deleteAllNotifications'],
    mutationFn: NotificationsService.deleteAll,
    onSuccess: () => {
      queryClient.setQueryData<INotificationMessage[]>(
        notificationQueries.list().queryKey,
        () => []
      )
      setLocalCount(0)
      showToast({ title: 'Уведомления успешно удалены', type: 'success' })
    },
    onError: () => {
      showToast({ title: 'Ошибка при удалении уведомлений', type: 'error' })
    }
  })

  const unreadCount =
    notifications && notifications.filter((n) => !n.isRead).length

  return {
    notifications,
    count: unreadCount,
    deleteAsync,
    undeleteAsync,
    readAsync,
    readAllAsync,
    deleteAllAsync,
    fetchNotifications: refetch,
    isLoading,
    refetch
  }
}