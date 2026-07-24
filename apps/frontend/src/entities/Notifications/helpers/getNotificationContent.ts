import dayjs from 'dayjs'
import { INotificationMessage } from '@/entities/Notifications'
import { IUser } from '@/entities/User'
import { DATE_FORMAT } from '@/shared/const/date_format'
import { ENTITY } from '@/shared/const/translation'

const styledSpan = (text: string | Date | number) =>
  `<span style="font-weight:700; overflow-wrap: break-word; white-space: normal;">${text}</span>`

export const getNotificationContent = (
  notification: INotificationMessage,
  user: IUser,
  t: (key: string, options?: Record<string, any>) => string
): string => {
  const { task, project, workspace } = notification
  const taskName =
    notification.task?.name && styledSpan(notification.task!.name)

  const { update: taskUpdate } = task ?? {}

  const { update: projectUpdate } = project ?? {}

  const { update: workspaceUpdate } = workspace ?? {}

  const createMessage = (
    actionKey: string,
    taskName?: string,
    detail: string | Date | number = ''
  ) => {
    return t(actionKey, {
      taskName: taskName ? styledSpan(taskName) : undefined,
      detail: detail ? styledSpan(detail) : undefined
    })
  }

  if (taskUpdate) {
    const {
      newComment,
      newFile,
      status,
      deadlineDate,
      priority,
      execute,
      isExecutor,
      removeFromExecutor,
      isDeleted,
      changeProject,
      newSubtask,
      isAssigner,
      removeFromAssigner
    } = taskUpdate

    if (newComment && taskName) {
      return t('notifications.newComment', {
        author: styledSpan(newComment.author),
        taskName: styledSpan(taskName),
        ns: ENTITY
      })
    }
    if (newFile && taskName) {
      return t('notifications.newFile', {
        taskName: styledSpan(taskName),
        ns: ENTITY
      })
    }
    if (status) {
      return createMessage('notifications.statusChanged', taskName, status.name)
    }
    if (deadlineDate) {
      return createMessage(
        'notifications.deadlineChanged',
        taskName,
        dayjs(deadlineDate).format(DATE_FORMAT)
      )
    }
    if (priority) {
      return createMessage('notifications.priorityChanged', taskName, priority)
    }
    if (execute && taskName) {
      return t('notifications.taskCompleted', {
        executor: styledSpan(execute.executor.name),
        taskName,
        ns: ENTITY
      })
    }
    if (isExecutor && taskName) {
      return t('notifications.assignedAsExecutor', { taskName, ns: ENTITY })
    }
    if (isAssigner && taskName) {
      return t('notifications.assignedAsAssigner', { taskName, ns: ENTITY })
    }
    if (removeFromExecutor && taskName) {
      return t('notifications.removedFromExecutor', { taskName, ns: ENTITY })
    }
    if (removeFromAssigner && taskName) {
      return t('notifications.removedFromAssigner', { taskName, ns: ENTITY })
    }
    if (isDeleted && taskName) {
      return t('notifications.taskDeleted', { taskName, ns: ENTITY })
    }
    if (changeProject && taskName) {
      return t('notifications.taskMoved', {
        taskName,
        projectName: styledSpan(changeProject.name),
        ns: ENTITY
      })
    }
    if (newSubtask && taskName) {
      return t('notifications.newSubtask', {
        subtaskName: styledSpan(newSubtask.name),
        taskName,
        ns: ENTITY
      })
    }
  }

  if (projectUpdate) {
    const {
      invitation,
      acceptInvitation,
      declineInvitation,
      cancelInvitation
    } = projectUpdate

    if (invitation) {
      return t('notifications.invitedToProject', {
        user: styledSpan(
          `${invitation.sender.firstName} ${invitation.sender.lastName}`
        ),
        projectName: styledSpan(notification.project!.name),
        ns: ENTITY
      })
    }
    if (acceptInvitation) {
      if (acceptInvitation?.member.id === user.id) {
        return t('notifications.projectInvitationAccepted', {
          projectName: styledSpan(notification.project!.name),
          ns: ENTITY
        })
      }
      return t('notifications.projectInvitationAcceptedByUser', {
        user: styledSpan(
          `${acceptInvitation!.member.firstName} ${
            acceptInvitation!.member.lastName
          }`
        ),
        projectName: styledSpan(notification.project!.name),
        ns: ENTITY
      })
    }
    if (declineInvitation) {
      if (declineInvitation?.invitee.id === user.id) {
        return t('notifications.projectInvitationDeclined', {
          projectName: styledSpan(notification.project!.name),
          ns: ENTITY
        })
      }
      return t('notifications.projectInvitationDeclinedByUser', {
        user: styledSpan(
          `${declineInvitation!.invitee.firstName} ${
            declineInvitation!.invitee.lastName
          }`
        ),
        projectName: styledSpan(notification.project!.name),
        ns: ENTITY
      })
    }
    if (cancelInvitation) {
      return t('notifications.projectInvitationCancelled', {
        user: styledSpan(
          `${cancelInvitation!.canceler.firstName} ${
            cancelInvitation!.canceler.lastName
          }`
        ),
        projectName: styledSpan(notification.project!.name),
        ns: ENTITY
      })
    }
  }

  if (workspaceUpdate) {
    const {
      invitation,
      acceptInvitation,
      declineInvitation,
      cancelInvitation
    } = workspaceUpdate

    if (invitation) {
      return t('notifications.invitedToWorkspace', {
        user: styledSpan(
          `${invitation.sender.firstName} ${invitation.sender.lastName}`
        ),
        workspaceName: styledSpan(notification.workspace!.name),
        ns: ENTITY
      })
    }
    if (acceptInvitation) {
      if (acceptInvitation?.member.id === user.id) {
        return t('notifications.workspaceInvitationAccepted', {
          workspaceName: styledSpan(notification.workspace!.name),
          ns: ENTITY
        })
      }
      return t('notifications.workspaceInvitationAcceptedByUser', {
        user: styledSpan(
          `${acceptInvitation!.member.firstName} ${
            acceptInvitation!.member.lastName
          }`
        ),
        workspaceName: styledSpan(notification.workspace!.name),
        ns: ENTITY
      })
    }
    if (declineInvitation) {
      if (declineInvitation?.invitee.id === user.id) {
        return t('notifications.workspaceInvitationDeclined', {
          workspaceName: styledSpan(notification.workspace!.name),
          ns: ENTITY
        })
      }
      return t('notifications.workspaceInvitationDeclinedByUser', {
        user: styledSpan(
          `${declineInvitation!.invitee.firstName} ${
            declineInvitation!.invitee.lastName
          }`
        ),
        workspaceName: styledSpan(notification.workspace!.name),
        ns: ENTITY
      })
    }
    if (cancelInvitation) {
      return t('notifications.workspaceInvitationCancelled', {
        user: styledSpan(
          `${cancelInvitation!.canceler.firstName} ${
            cancelInvitation!.canceler.lastName
          }`
        ),
        workspaceName: styledSpan(notification.workspace!.name),
        ns: ENTITY
      })
    }
  }

  if (task?.isCreated && taskName) {
    return t('notifications.taskCreated', { taskName, ns: ENTITY })
  }

  return t('notifications.unknown', { ns: ENTITY })
}