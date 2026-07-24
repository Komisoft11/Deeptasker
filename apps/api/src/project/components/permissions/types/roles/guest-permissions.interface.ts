import { IProjectPermissions } from '../project-permissions.interface'

export type ProjectGuestPermissions = Pick<IProjectPermissions, 'openTasks'>
