import { createQueryKeys } from '@lukemorales/query-key-factory'
import { Project, ProjectService } from '@/entities/Project'

export const projectsQueries = createQueryKeys('project', {
  members: (project: Project, workspaceId: number) => ({
    queryKey: [
      {
        projectId: project?.id
      }
    ],
    queryFn: (ctx) => {
      return ProjectService.getMembers(project, workspaceId)
    }
  }),

  invitees: (project: Project, workspaceId: number) => ({
    queryKey: [
      {
        projectId: project?.id
      }
    ],
    queryFn: (ctx) => {
      return ProjectService.getInvitees(project, workspaceId)
    }
  })
})
