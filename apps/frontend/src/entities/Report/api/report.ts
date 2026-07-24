import { createQueryKeys } from '@lukemorales/query-key-factory'
import { Project, ProjectService } from '@/entities/Project'

export const reportsQueries = createQueryKeys('reports', {
  reports: (project: Project) => ({
    queryKey: ['reports', project.id],
    queryFn: () => ProjectService.getReportsByProject(project)
  })
})
