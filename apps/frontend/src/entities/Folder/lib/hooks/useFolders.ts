import { UseMutationResult } from '@tanstack/react-query/src/types'
import { useTranslation } from 'react-i18next'
import {
  Folder,
  FolderService,
  ICreateFolderDTO,
  IUpdateFolderDTO
} from '@/entities/Folder'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { ERRORS, SUCCESS } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ICreatedRecord } from '@/shared/types/created-record.interface'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'


interface IReturn {
  createAsync: UseMutationResult<ICreatedRecord, unknown, ICreateFolderDTO>
  updateAsync: UseMutationResult<void, unknown, IUpdateFolderDTO>
  deleteAsync: UseMutationResult<void, unknown, Folder>
  isTitleExistsInCurrentDirectory: (title: string) => boolean
}

export const useFolders = (): IReturn => {
  const { folderStore, projectStore } = useRootStore()
  const { t } = useTranslation([ERRORS, SUCCESS])

  const createAsync = useCreateMutation<
    ICreatedRecord,
    unknown,
    ICreateFolderDTO
  >({
    mutationKey: ['create folder'],
    mutationFn: FolderService.create,
    onSuccess: (data, variables) => {
      folderStore.create(data, variables)
      projectStore.activeProject.folderCount++
      showToast({
        title: t('folder.create', { ns: SUCCESS, title: data.title }),
        type: 'success'
      })
    },
    onError: (_, variables) => {
      showToast({
        title: variables.title
          ? t('folder.create', {
              ns: ERRORS,
              title: variables.title
            })
          : t('folder.create', {
              ns: ERRORS
            }),
        type: 'error'
      })
    }
  })

  const updateAsync = useCreateMutation<void, unknown, IUpdateFolderDTO>({
    mutationKey: ['update folder'],
    mutationFn: FolderService.update,
    onSuccess: (_, variables) => {
      folderStore.update(variables)
      showToast({
        type: 'success',
        title: t('folder.update', {
          ns: SUCCESS
        })
      })
    },
    onError: () => {
      showToast({
        type: 'error',
        title: t('folder.update', {
          ns: ERRORS
        })
      })
    }
  })

  const deleteAsync = useCreateMutation<void, unknown, Folder>({
    mutationKey: ['delete folder'],
    mutationFn: FolderService.delete,
    onSuccess: (_, variables) => {
      folderStore.delete(variables)
      projectStore.activeProject.folderCount--
      showToast({
        title: t('folder.delete', {
          ns: SUCCESS,
          title: variables.title
        }),
        type: 'success'
      })
    },
    onError: (_, variables) => {
      showToast({
        title: t('folder.delete', {
          ns: ERRORS,
          title: variables.title
        }),
        type: 'error'
      })
    }
  })

  const isTitleExistsInCurrentDirectory = (title: string): boolean => {
    if (folderStore.activeFolder) {
      return folderStore.activeFolder.subFolders.some(
        (f: Folder) => f.title === title
      )
    }

    return folderStore.rootFolders.some((f: Folder) => f.title === title)
  }

  return {
    createAsync,
    updateAsync,
    deleteAsync,
    isTitleExistsInCurrentDirectory
  }
}
