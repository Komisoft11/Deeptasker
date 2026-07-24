import { IProjectPermissions } from '../project-permissions.interface'
import { ProjectUserPermissions } from './user-permissions.interface'

export type ProjectAssignerPermissions = ProjectUserPermissions &
  Pick<
    IProjectPermissions,
    | 'editFolders'
    | 'deleteFolders'
    | 'moveTasks'
    | 'changeTaskAssigner'
    | 'changeTaskExecutor'
    | 'deleteTaskFile'
    | 'manageTaskObservers'
    | 'editTaskDeadline'
    | 'editTaskDescription'
    | 'editTaskPriority'
    | 'editTaskStatus'
    | 'editTaskTags'
    | 'editTaskTitle'
    | 'updateSprints'
    | 'deleteSprints'
    | 'createSprints'
    | 'listReports'
    | 'createTags'
    | 'updateTags'
    | 'deleteTags'
  >
