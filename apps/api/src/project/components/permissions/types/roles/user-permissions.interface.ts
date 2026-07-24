import { IProjectPermissions } from '../project-permissions.interface'
import { ProjectGuestPermissions } from './guest-permissions.interface'

export type ProjectUserPermissions = ProjectGuestPermissions &
  Pick<
    IProjectPermissions,
    'createTasks' | 'createFolders' | 'createTags' | 'updateTags' | 'deleteTags'
  >
