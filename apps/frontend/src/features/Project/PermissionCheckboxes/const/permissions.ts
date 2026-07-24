import { IPermissionProject } from '@/entities/Project'

export const alwaysDisabledListKeys: (keyof IPermissionProject)[] = [
  'listTasks',
  'listSprints',
  'listFolders'
]