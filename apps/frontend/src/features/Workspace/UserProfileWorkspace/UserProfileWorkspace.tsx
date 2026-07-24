import { FC } from 'react'
import { MemberPermissionSettings } from '@/features/User/MemberPermissionSettings/MemberPermissionSettings'
import { PermissionCheckboxes } from '@/features/Workspace'
import { IUser } from '@/entities/User'
import { Workspace, useWorkspaces } from '@/entities/Workspace'
import { usePermissionWorkspace } from '@/entities/Workspace/model/PermissionWorkspace'

interface Props {
  user: IUser
  workspace: Workspace
  setSelectedUser: (user: IUser | undefined) => void
}

export const UserProfileWorkspace: FC<Props> = ({
  user,
  setSelectedUser,
  workspace
}) => {
  const { removeMemberAsync } = useWorkspaces()
  const removeMember = () => {
    removeMemberAsync.mutate({
      workspace,
      memberId: user.id
    })
    setSelectedUser(undefined)
  }
  const { canManageAdmins } = usePermissionWorkspace(workspace)

  return (
    <MemberPermissionSettings
      user={user}
      isWorkspace={true}
      onClick={removeMember}
      removeUsers={canManageAdmins}
    >
      <PermissionCheckboxes workspace={workspace} user={user} />
    </MemberPermissionSettings>
  )
}
