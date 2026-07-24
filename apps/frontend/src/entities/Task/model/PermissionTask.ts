import { usePermissionProject } from '@/entities/Project'
import { Task } from '@/entities/Task'
import { StatusCodes } from '@/shared/const/statusCodes'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

export interface IPermissionTask {
  isLoading: boolean
  canOpenTask: boolean
  canMoveTask: boolean
  canChangeTaskExecutor: boolean
  canChangeTaskAssigner: boolean
  canTrackTask: boolean
  canCreateSubTasks: boolean
  canEditTitleTask: boolean
  canEditDescriptionTask: boolean
  canCreateCommentsTask: boolean
  canAddFiles: boolean
  canChangeDeadline: boolean
  canDeleteTask: boolean
  canExecuteTask: boolean
  canConfirmTask: boolean
  canChangeObserver: boolean
  canChangePriority: boolean
  canEditTags: boolean
  canChangeProject: (canCreateTasksInTargetProject?: boolean) => boolean
  canChangeFolder: (isFolderOwner?: boolean) => boolean
  canChangeStatus: boolean
  editTaskTracking: boolean
  canDeleteTaskComments: (isAuthor: boolean) => boolean
  canEditTaskComments: (isAuthor: boolean) => boolean
  canReactTaskComment: boolean
  canRemoveReactionTaskComment: (isAuthor: boolean) => boolean
  canChangePlanDate: boolean
  canChangeSprint: boolean
  canChangeEstimatedTime: boolean
}

interface IBasePropertiesPermissionTask
  extends Omit<
    IPermissionTask,
    | 'isLoading'
    | 'canTrackTask'
    | 'canCreateSubTasks'
    | 'canChangeDeadline'
    | 'canChangeProject'
    | 'editTaskTracking'
    | 'canChangeTaskExecutor'
    | 'canChangeTaskAssigner'
    | 'canChangeEstimatedTime'
    | 'canChangeSprint'
    | 'canChangePlanDate'
  > {}

export const usePermissionTask = (task?: Task): IPermissionTask => {
  const {
    authStore: { user },
    projectStore: { activeProject }
  } = useRootStore()

  const { permissions: permissionsProject } = usePermissionProject()

  if (!task || activeProject.dateArchived) {
    return {
      isLoading: false,
      canOpenTask: permissionsProject.openTasks,

      canTrackTask: false,
      editTaskTracking: false,

      canExecuteTask: false,
      canMoveTask: false,
      canChangeStatus: false,
      canChangePriority: false,
      canEditTags: false,
      canChangePlanDate: false,
      canChangeDeadline: false,
      canChangeSprint: false,
      canChangeEstimatedTime: false,
      canChangeTaskExecutor: false,
      canChangeTaskAssigner: false,
      canChangeObserver: false,

      canEditDescriptionTask: false,
      canEditTitleTask: false,

      canCreateSubTasks: false,

      canCreateCommentsTask: false,
      canDeleteTaskComments: () => false,
      canEditTaskComments: () => false,
      canReactTaskComment: false,
      canRemoveReactionTaskComment: () => false,

      canAddFiles: false,

      canDeleteTask: false,
      canConfirmTask: false,

      canChangeProject: () => false,
      canChangeFolder: () => false
    }
  }

  const isOwner = task.user.id === user.id
  const isAssigner = task.assigner?.id === user.id
  const isExecutor = task.executor?.id === user.id
  const isObserver = task.invited.some(
    (observer) => observer.user.id === user.id
  )

  const basePermissions: IBasePropertiesPermissionTask = {
    canConfirmTask:
      permissionsProject.confirmExecuteTask || isOwner || isAssigner,
    canOpenTask:
      permissionsProject.openTasks || isExecutor || isOwner || isAssigner,
    canMoveTask: permissionsProject.moveTasks || isOwner,
    canEditTitleTask: permissionsProject.editTaskTitle || isOwner || isAssigner,
    canEditDescriptionTask:
      permissionsProject.editTaskDescription || isOwner || isAssigner,
    canCreateCommentsTask: isOwner || isAssigner || isExecutor || isObserver,
    canAddFiles: isOwner || isAssigner,
    canDeleteTask: permissionsProject.deleteTasks || isOwner,
    canExecuteTask: permissionsProject.executeTask || isExecutor,
    canChangeObserver:
      permissionsProject.manageTaskObservers || isOwner || isAssigner,
    canChangePriority:
      permissionsProject.editTaskPriority || isOwner || isAssigner,
    canEditTags: permissionsProject.editTaskTags || isOwner || isAssigner,
    canChangeFolder: (isFolderOwner) =>
      Boolean(
        permissionsProject.moveTasks ||
          ((isOwner || isAssigner) && isFolderOwner)
      ),
    canChangeStatus: permissionsProject.editTaskStatus || isOwner,
    canDeleteTaskComments: (isAuthor) =>
      isAuthor ||
      permissionsProject.deleteTaskComments ||
      isOwner ||
      isAssigner,
    canEditTaskComments: (isAuthor) => isAuthor,
    canReactTaskComment: isOwner || isAssigner || isExecutor || isObserver,
    canRemoveReactionTaskComment: (isAuthor) => isAuthor
  }

  if (task.status.code === StatusCodes.EXECUTED) {
    return {
      isLoading: false,
      canTrackTask: false,
      canCreateSubTasks: false,
      canChangeDeadline: false,
      canChangeProject: () => false,
      editTaskTracking: false,
      canChangeTaskExecutor: false,
      canChangeTaskAssigner: false,
      canChangePlanDate: false,
      canChangeSprint: false,
      canChangeEstimatedTime: false,
      ...basePermissions
    }
  }

  return {
    isLoading: false,
    canTrackTask: isExecutor,
    canCreateSubTasks:
      permissionsProject.createTasks && permissionsProject.openTasks,
    canChangeDeadline:
      permissionsProject.editTaskDeadline || isOwner || isAssigner,
    canChangeProject: (canCreateTasksInTargetProject) =>
      Boolean(basePermissions.canDeleteTask && canCreateTasksInTargetProject),
    editTaskTracking: permissionsProject.editTaskTracking || isExecutor,
    canChangeTaskExecutor:
      (permissionsProject.changeTaskExecutor || isOwner || isAssigner) &&
      !task.isTrackingByOtherUser,
    canChangeTaskAssigner: permissionsProject.changeTaskAssigner || isOwner,
    canChangePlanDate:
      permissionsProject.editTaskDeadline || isOwner || isAssigner,
    canChangeSprint: isOwner || isAssigner,
    canChangeEstimatedTime:
      permissionsProject.editTaskDeadline || isOwner || isAssigner,
    ...basePermissions
  }
}
