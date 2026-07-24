import classNames from 'classnames'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import React, { FC, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import {
  INotificationMessage,
  InvitationControls,
  getNotificationContent
} from '@/entities/Notifications'
import { useNotifications } from '@/entities/Notifications/lib/hooks/useNotifications'
import { Close } from '@/shared/assets/images/icons'
import { TIME_FORMAT } from '@/shared/const/date_format'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { MainPageNavigator } from '@/shared/lib/navigators/main.navigator'
import { NotificationsNavigator } from '@/shared/lib/navigators/notifications.navigator'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Timeout } from '@/shared/types/time.interface'
import styles from './NotificationItem.module.scss'

const AUTO_DELETE_DELAY_MS = 10_000

interface Props {
  notification: INotificationMessage
  notificationClassName?: string
  onOpenChange?: (open: boolean) => void
  isPopover: boolean
  isDeleted: boolean
  onDelete: (n: INotificationMessage) => void
  onUndoDelete: (n: INotificationMessage) => void
}

export const NotificationItem: FC<Props> = observer(
  ({
    notification,
    notificationClassName,
    onOpenChange,
    isPopover,
    isDeleted,
    onDelete,
    onUndoDelete
  }) => {
    const { workspace, project, task } = notification
    const {
      workspaceStore: { activeWorkspace },
      authStore: { user }
    } = useRootStore()
    const { t } = useTranslation([ENTITY, TRANSLATION])

    const dateCreated = dayjs(notification.dateCreated)
    const htmlContent = getNotificationContent(notification, user, t)

    const { deleteAsync, undeleteAsync, readAsync } = useNotifications()

    const timeoutRef = useRef<Timeout | null>(null)

    const scheduleDelete = (notification: INotificationMessage) => {
      onDelete(notification)

      timeoutRef.current = setTimeout(() => {
        deleteAsync.mutate(notification.uuid)
        timeoutRef.current = null
      }, AUTO_DELETE_DELAY_MS)
    }

    const cancelDeletion = (notification: INotificationMessage) => {
      onUndoDelete(notification)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      } else {
        undeleteAsync.mutate(notification.uuid)
      }
    }

    const getNotificationUrl = (notification: INotificationMessage): string => {
      if (notification.workspace && notification.project && notification.task) {
        return ProjectsNavigator.getOpenTaskUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: notification.project.slug,
          externalId: notification.task.externalId
        })
      }

      if (notification.workspace && notification.project) {
        return ProjectsNavigator.getExistProjectUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: notification.project.slug
        })
      }

      if (notification.workspace) {
        return MainPageNavigator.getEmptyProjectUrl(activeWorkspace.id)
      }

      return NotificationsNavigator.getNotificationsUrl()
    }

    const handleMouseEnter = async () => {
      if (!notification.isRead) {
        await readAsync.mutateAsync(notification)
      }
    }

    if (isDeleted) {
      return (
        <li
          className={classNames(styles.notificationText, notificationClassName)}
        >
          <div className='flex gap-2'>
            <p className='body-14-16 secondaryText'>
              {t('notifications.deleted', { ns: ENTITY })}
            </p>
            <p
              className='body-14-16 text-accent hover:opacity-50'
              onClick={() => cancelDeletion(notification)}
            >
              {t('cancel', { ns: TRANSLATION })}
            </p>
          </div>
        </li>
      )
    }

    const invitationNotification =
      project?.update?.invitation || workspace?.update?.invitation

    return (
      <li
        className={classNames(
          styles.notificationText,
          invitationNotification && 'bg-hover rounded-lg',
          invitationNotification && isPopover && 'pr-4'
        )}
        onMouseEnter={handleMouseEnter}
      >
        {!notification.isRead && (
          <div
            className={
              'bg-systemRed w-2 h-2 rounded-full absolute top-2 left-2'
            }
          />
        )}
        <div
          className={classNames(
            'flex flex-col gap-1 max-w-[calc(100%-40px)] w-full',
            invitationNotification && isPopover && 'max-w-full w-full'
          )}
        >
          <Link
            className={'body-14-20 wrap-break-word'}
            dangerouslySetInnerHTML={{ __html: htmlContent || '' }}
            to={getNotificationUrl(notification)}
            onClick={() => {
              if (onOpenChange) {
                onOpenChange(false)
              }
            }}
          ></Link>
          {task?.update?.newComment && (
            <p className={styles.comment}>{task?.update?.newComment.content}</p>
          )}
          <p className={'body-14-16 secondaryText'}>
            {[dateCreated.format(TIME_FORMAT), project?.name, workspace?.name]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {invitationNotification && (
            <InvitationControls
              isPopover={isPopover}
              notification={notification}
            />
          )}
        </div>

        {!invitationNotification && (
          <div
            className={'iconContainer h-max absolute top-2 right-2'}
            onClick={() => scheduleDelete(notification)}
          >
            <Close
              className={classNames('icon w-4 h-4 opacity-0', styles.delete)}
            />
          </div>
        )}
      </li>
    )
  }
)
