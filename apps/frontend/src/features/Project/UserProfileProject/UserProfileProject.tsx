import { FC } from 'react'
import { PermissionCheckboxes } from '@/features/Project/PermissionCheckboxes/PermissionCheckboxes'
import { MemberPermissionSettings } from '@/features/User/MemberPermissionSettings/MemberPermissionSettings'
import { Project, usePermissionProject, useProjects } from '@/entities/Project'
import { IUser } from '@/entities/User'

interface Props {
  user: IUser
  project: Project
  setSelectedUser: (user: IUser | undefined) => void
}

export const UserProfileProject: FC<Props> = ({
  setSelectedUser,
  user,
  project
}) => {
  const { removeMemberAsync } = useProjects()

  const removeMember = async () => {
    await removeMemberAsync.mutateAsync({ project: project, member: user })
    setSelectedUser(undefined)
  }

  const {
    permissions: { manageAdmins: canManageAdmins, removeUsers }
  } = usePermissionProject(project)

  return (
    <MemberPermissionSettings
      user={user}
      onClick={removeMember}
      removeUsers={removeUsers}
    >
      <PermissionCheckboxes
        user={user}
        project={project}
        canManageAdmins={canManageAdmins}
      />
    </MemberPermissionSettings>
  )
}
