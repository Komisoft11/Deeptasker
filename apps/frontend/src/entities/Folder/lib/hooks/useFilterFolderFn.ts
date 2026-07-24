import { FilterHelper } from '@/shared/lib/helpers/filter.helper'
import { useCallback } from 'react'
import { Folder } from '@/entities/Folder'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

export const useFilterFolderFn = () => {
  const { folderFilterStore } = useRootStore()

  const { queryFolder, activeSorter } = folderFilterStore

  const { genericSort, genericSearch, genericFilter, multiPropertySort } =
    FilterHelper

  const filterFolders = useCallback(
    (folders: Folder[]) => {
      let filteredFolders = folders

      if (queryFolder) {
        filteredFolders = filteredFolders.filter((task) =>
          genericSearch<Folder>(task, ['title', 'id'], queryFolder)
        )
      }

      return filteredFolders
    },
    [queryFolder, genericSearch, genericFilter]
  )

  const sortFolders = useCallback(
    (folders: Folder[]) => {
      return folders.slice().sort(genericSort<Folder>(activeSorter))
    },
    [activeSorter, genericSort, multiPropertySort]
  )

  return useCallback(
    (folders: Folder[]) => {
      return sortFolders(filterFolders(folders))
    },
    [filterFolders, sortFolders]
  )
}
