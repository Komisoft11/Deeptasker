import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import {
  IProjectPermissionRole,
  Project,
  defaultProjectRolesPermissions
} from '@/entities/Project'
import { IUser } from '@/entities/User'
import { queries } from '@/entities/lib/api/all-queries'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'


const FRESH_STALE_TIME_MINUTES = 5
const FRESH_STALE_TIME_MS = FRESH_STALE_TIME_MINUTES * 60 * 1000
export const usePermissionProject = (
  _project?: Project,
  _user?: IUser // if null => will current user
): IProjectPermissionRole => {
  const {
    authStore: { user: currentUser },
    projectStore: { activeProject }
  } = useRootStore()

  const project = _project ? _project : activeProject
  const user = _user ? _user : currentUser

  const { data } = useQuery({
    ...queries.user.permissionsProject(project, user),
    initialData: {
      projectId: 1,
      role: 'guest',
      permissions: defaultProjectRolesPermissions.guest
    },
    staleTime: FRESH_STALE_TIME_MS,
    initialDataUpdatedAt: dayjs()
      .subtract(FRESH_STALE_TIME_MINUTES, 'minute')
      .unix() // нужно для того, чтобы сразу сделать initialData - "не свежими данными", чтобы с сервера потянуть свежее
  })

  return data
}