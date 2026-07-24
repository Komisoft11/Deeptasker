import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Notifications } from '@/widgets/Notifications/Notifications'
import { useNotifications } from '@/entities/Notifications/lib/hooks/useNotifications'
import { Close, Notifications as Icon } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import useDialogAndPopover from '@/shared/lib/hooks/useDialogAndPopover'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { NotificationsNavigator } from '@/shared/lib/navigators/notifications.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { Popover } from '@/shared/ui/Popover/Popover'


interface Props {
  isSidebarCollapsed: boolean
}

export const NotificationPopover = observer(({ isSidebarCollapsed }: Props) => {
  const { count, readAllAsync, fetchNotifications, isLoading, notifications } =
    useNotifications()
  const { sidebarStore } = useRootStore()
  const { open, onOpenChange } = useDialogAndPopover(false)
  const navigate = useNavigate()
  const { t } = useTranslation([ENTITY, TRANSLATION])

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)

    if (isOpen && !notifications) {
      fetchNotifications()
    }
  }

  const handleReadAll = async () => {
    await readAllAsync.mutateAsync()
  }

  const handleOpenAllNotifications = () => {
    onOpenChange(false)
    if (sidebarStore.isSecondLeftOpen) {
      sidebarStore.closeLeftSecondSidebar()
    }
    navigate(NotificationsNavigator.getNotificationsUrl())
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <Popover.Trigger
        className={classNames(
          'p-0 hover:bg-hover border border-solid border-transparent',
          isSidebarCollapsed ? 'justify-center' : 'py-1',
          open && 'bg-hover !border-border'
        )}
      >
        <div
          className={classNames(
            'relative rounded-lg',
            !isSidebarCollapsed ? 'p-2' : 'p-3'
          )}
        >
          <Icon className={'icon'} />
          {count !== 0 && (
            <div
              className={
                'w-2 h-2 bg-systemRed rounded-full absolute top-[3px] right-[6px]'
              }
            />
          )}
        </div>
        {!isSidebarCollapsed && (
          <p className={'body-14-16'}>
            {t('notifications', { ns: TRANSLATION })}
          </p>
        )}
      </Popover.Trigger>
      <Popover.Content
        side={'right'}
        sideOffset={16}
        className={
          'h-[calc(100dvh-64px)] mb-8 w-[480px] flex flex-col gap-2 p-4'
        }
      >
        <div className={'flex justify-between items-center'}>
          <h3 className={'flex items-center'}>
            {t('notifications', { ns: TRANSLATION })} (
            {notifications && notifications.length})
          </h3>
          <div className={'flex gap-2 items-center'}>
            {count > 0 && (
              <Button
                styleButton={'filled'}
                className={'body-14-16 p-2'}
                onClick={handleReadAll}
              >
                {t('notifications.readAll', { ns: ENTITY })}
              </Button>
            )}
            <div
              className={'iconContainer'}
              onClick={() => onOpenChange(false)}
            >
              <Close className={'w-4 h-4 icon'} />
            </div>
          </div>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div
              className={classNames(
                'overflow-y-auto flex-1',
                'scrollbarContainerOnObjects'
              )}
            >
              <Notifications
                notificationClassName={'px-4'}
                onOpenChange={onOpenChange}
                isPopover
              />
            </div>

            <Button
              styleButton={'filled'}
              className={'w-full body-16 pt-3'}
              onClick={handleOpenAllNotifications}
            >
              {t('notifications.all', { ns: ENTITY })}
            </Button>
          </>
        )}
      </Popover.Content>
    </Popover>
  )
})
