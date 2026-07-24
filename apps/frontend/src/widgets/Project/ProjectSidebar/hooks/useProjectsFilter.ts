import { useCallback } from 'react'
import { Project } from '@/entities/Project'
import { FilterHelper } from '@/shared/lib/helpers/filter.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

export const useProjectsFilter = () => {
  const {
    projectFilterStore: { queryProject }
  } = useRootStore()

  const { genericSearch, genericFilter } = FilterHelper

  const filterProjects = useCallback(
    (projects: Project[]) => {
      let filteredProjects = projects

      if (queryProject) {
        filteredProjects = filteredProjects.filter((project) => {
          return genericSearch<Project>(project, ['title', 'id'], queryProject)
        })
      }

      return filteredProjects
    },
    [queryProject, genericSearch, genericFilter]
  )

  return useCallback(
    (projects: Project[]) => {
      return filterProjects(projects)
    },
    [filterProjects]
  )
}
