import { createQueryKeys } from '@lukemorales/query-key-factory'
import { Workspace } from '@/entities/Workspace'
import { WorkspaceService } from '@/entities/Workspace/service/workspace.service'

export const workspaceQueries = createQueryKeys('workspace', {
  admin: (workspace: Workspace) => ({
    queryKey: [
      {
        projectId: workspace.id
      }
    ],
    queryFn: (ctx) => WorkspaceService.getAdmins(workspace)
  }),
  invitees: (workspace: Workspace) => ({
    queryKey: [
      {
        projectId: workspace.id
      }
    ],
    queryFn: (ctx) => WorkspaceService.getInvitees(workspace)
  })
})
