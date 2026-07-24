import { createQueryKeys } from '@lukemorales/query-key-factory'
import { Project } from '@/entities/Project'
import { AuthService, IUser } from '@/entities/User'
import { UserService } from '@/entities/User/services/user.service'
import { Workspace } from '@/entities/Workspace'


export const usersQueries = createQueryKeys('user', {
  permissionsProject: (project: Project, user: IUser) => ({
    queryKey: [
      {
        projectId: project.id,
        userId: user.id
      }
    ],
    queryFn: () => {
      return AuthService.getPermissionProject(project, user)
    }
  }),
  permissionsWorkspace: (workspace: Workspace, user: IUser) => ({
    queryKey: [
      {
        workspaceId: workspace.id,
        userId: user.id
      }
    ],
    queryFn: () => AuthService.getPermissionWorkspace(workspace, user)
  }),
  getUsersByIds: (ids: number[], project: Project, key?: string) => ({
    queryKey: [
      {
        project: project.id,
        userIds: ids,
        key
      }
    ],
    queryFn: () => UserService.findInProject('', project.id, ids)
  })
})
