import { IProjectPermissions } from '../project-permissions.interface'
import { ProjectUserPermissions } from './user-permissions.interface'

export type ProjectControllerPermissions = ProjectUserPermissions &
  Pick<
    IProjectPermissions,
    | 'generateReports'
    | 'removeUsers'
    | 'moveTasks'
    | 'deleteTasks'
    | 'confirmExecuteTask'
    | 'deleteTaskFile'
    | 'manageTaskObservers'
    | 'deleteTaskComments'
    | 'editTaskStatus'
    | 'editTaskTracking'
    | 'listReports'
    | 'deleteReports'
    | 'createTags'
    | 'updateTags'
    | 'deleteTags'
  >
