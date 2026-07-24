import { createQueryKeys } from '@lukemorales/query-key-factory'
import { Project, ProjectService } from '@/entities/Project'

export const folderQueries = createQueryKeys('folders', {
  folders: (project: Project) => ({
    queryKey: ['folders'],
    queryFn: ProjectService.getFoldersByProject(project)
  })
})
