import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { INotificationMessage } from '@/entities/Notifications'
import { useNotifications } from '@/entities/Notifications/lib/hooks/useNotifications'
import { ProjectService } from '@/entities/Project'
import { WorkspaceService } from '@/entities/Workspace/service/workspace.service'
import { TRANSLATION } from '@/shared/const/translation'
import { Button } from '@/shared/ui/Button/Button'


interface Props {
  isPopover: boolean
  notification: INotificationMessage
}

export const InvitationControls = ({ isPopover, notification }: Props) => {
  const { deleteAsync: deleteNotificationAsync } = useNotifications()
  const { t } = useTranslation([TRANSLATION])

  const [isActionsDisabled, setIsActionsDisabled] = useState<boolean>(false)

  const handleAccept = async () => {
    let url = ''

    if (notification.workspace) {
      const { redirectUrl } = await WorkspaceService.acceptInvitation(
        notification.workspace?.id
      )
      url = redirectUrl
    } else if (notification.project) {
      const { redirectUrl } = await ProjectService.acceptInvitation(
        notification.project?.id,
        notification.project.workspaceId
      )
      url = redirectUrl
    }

    setIsActionsDisabled(true)

    await deleteNotificationAsync.mutateAsync(notification.uuid)

    if (url.length > 1) {
      window.location.href = url
    }
  }

  const handleDecline = async () => {
    if (notification.workspace) {
      await WorkspaceService.declineInvitation(notification.workspace?.id)
    } else if (notification.project) {
      await ProjectService.declineInvitation(
        notification.project?.id,
        notification.project.workspaceId
      )
    }

    setIsActionsDisabled(true)
    await deleteNotificationAsync.mutateAsync(notification.uuid)
  }

  return (
    <div className={'w-full flex gap-1 pt-4'}>
      <Button
        styleButton={'outline'}
        className={classNames(isPopover ? 'w-1/2' : 'w-[120px]', 'body-14-16')}
        onClick={handleDecline}
        disabled={isActionsDisabled}
      >
        {t('decline', { ns: TRANSLATION })}
      </Button>
      <Button
        styleButton={'filled'}
        className={classNames(isPopover ? 'w-1/2' : 'w-[120px]', 'body-14-16')}
        onClick={handleAccept}
        disabled={isActionsDisabled}
      >
        {t('accept', { ns: TRANSLATION })}
      </Button>
    </div>
  )
}
