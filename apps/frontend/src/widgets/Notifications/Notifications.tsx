import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from '@/widgets/Notifications/Notifications.module.scss'
import { INotificationMessage, NotificationItem, useGroupedNotifications } from '@/entities/Notifications'
import { useNotifications } from '@/entities/Notifications/lib/hooks/useNotifications'
import { ENTITY } from '@/shared/const/translation'

interface Props {
  className?: string
  notificationClassName?: string
  onOpenChange?: (open: boolean) => void
  isPopover?: boolean
}

export const Notifications: FC<Props> = observer(
  ({ className, notificationClassName, onOpenChange, isPopover = false }) => {
    const { notifications, deleteAsync } = useNotifications()
    const { t } = useTranslation([ENTITY])

    const [deletedNotifications, setDeletedNotifications] = useState<
      INotificationMessage[]
    >([])

    const groupedNotifications = useGroupedNotifications(notifications)

    useEffect(() => {
      if (!notifications) return

      const cancelIds = new Set<number>()

      for (const n of notifications) {
        const projectCancelId =
          n.project?.update?.cancelInvitation?.invitationId
        const workspaceCancelId =
          n.workspace?.update?.cancelInvitation?.invitationId

        if (projectCancelId) cancelIds.add(projectCancelId)
        if (workspaceCancelId) cancelIds.add(workspaceCancelId)
      }

      for (const n of notifications) {
        const projectInvitationId = n.project?.update?.invitation?.invitationId
        const workspaceInvitationId =
          n.workspace?.update?.invitation?.invitationId

        if (
          (projectInvitationId && cancelIds.has(projectInvitationId)) ||
          (workspaceInvitationId && cancelIds.has(workspaceInvitationId))
        ) {
          deleteAsync.mutate(n.uuid)
        }
      }
    }, [notifications, deleteAsync])

    return (
      <div className={classNames(styles.container, className)}>
        {groupedNotifications.length === 0 && (
          <p className={'body-12 secondaryText'}>
            {t('notifications.empty', { ns: ENTITY })}
          </p>
        )}

        <div className={styles.list}>
          {groupedNotifications &&
            groupedNotifications.map(({ date, notifications }) => {
              const sortedNotifications = notifications.sort((a, b) => {
                const dateA = new Date(a.dateCreated).getTime()
                const dateB = new Date(b.dateCreated).getTime()

                return dateB - dateA
              })
              return (
                <div key={date} className={styles.dateSortedContainer}>
                  <div className={styles.date}>
                    <div
                      className={classNames(
                        styles.line,
                        isPopover && 'bg-hover'
                      )}
                    ></div>
                    <p className={'body-14-20'}>{date}</p>
                    <div
                      className={classNames(
                        styles.line,
                        isPopover && 'bg-hover'
                      )}
                    ></div>
                  </div>

                  <ul className={styles.notifications}>
                    {sortedNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.uuid}
                        isDeleted={deletedNotifications.some(
                          (item) => item.uuid === notification.uuid
                        )}
                        onDelete={(n: INotificationMessage) => {
                          setDeletedNotifications((prev) => [...prev, n])
                        }}
                        onUndoDelete={(n: INotificationMessage) =>
                          setDeletedNotifications((prev) =>
                            prev.filter((item) => item.uuid !== n.uuid)
                          )
                        }
                        {...{
                          notification,
                          notificationClassName,
                          onOpenChange,
                          isPopover
                        }}
                      />
                    ))}
                  </ul>
                </div>
              )
            })}
        </div>
      </div>
    )
  }
)