import { useQuery } from '@tanstack/react-query'
import React, { FC } from 'react'
import { queryStaleTimeMembersAndInvitees } from '@/features/Project/ProjectMembers/const/const'
import { UserInviter } from '@/features/User'
import { UserTable } from '@/features/User/UserTable/UserTable'
import styles from '@/features/User/UserTable/UserTable.module.scss'
import { Project, usePermissionProject, useProjects } from '@/entities/Project'
import { IUser } from '@/entities/User'
import { queries } from '@/entities/lib/api/all-queries'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Loading } from '@/shared/ui/Loading/Loading'


interface TableProps {
  setSelectedUser: (user: IUser) => void
  project: Project
}

export const ProjectMembers: FC<TableProps> = ({
  setSelectedUser,
  project
}) => {
  const {
    workspaceStore: { activeWorkspace }
  } = useRootStore()

  const { data: members, isLoading: isMembersLoading } = useQuery({
    ...queries.project.members(project, activeWorkspace.id),
    staleTime: queryStaleTimeMembersAndInvitees
  })

  const { data: invitees, isLoading: isInviteesLoading } = useQuery({
    ...queries.project.invitees(project, activeWorkspace.id),
    staleTime: queryStaleTimeMembersAndInvitees
  })

  const { inviteMemberAsync, cancelInviteMemberAsync } = useProjects()

  const {
    permissions: { addUsers }
  } = usePermissionProject(project)

  const currentUser = LocalStorageHelper.getUser()
  const isYou = (user: IUser) => user.id === currentUser.id
  const isOwner = (user: IUser) => project.user.id === user.id

  const handleAddUser = async (value: string) => {
    if (!value.length) return

    await inviteMemberAsync.mutateAsync({
      project,
      email: value,
      senderId: currentUser.id
    })
  }

  const handleCancelInvite = async (value: string) => {
    await cancelInviteMemberAsync.mutateAsync({
      project,
      email: value,
      senderId: currentUser.id
    })
  }

  if (isMembersLoading || isInviteesLoading || !members) {
    return <Loading variant={'spinner'} />
  }

  return (
    <div className={'flex flex-col gap-3 flex-[1_0_0]'}>
      <UserTable
        setSelectedUser={setSelectedUser}
        isOwner={isOwner}
        isYou={isYou}
        users={members}
        invitees={invitees}
        cancelInvite={handleCancelInvite}
        project={project}
        isProjectPage
      />
      {addUsers && (
        <UserInviter
          onChange={handleAddUser}
          isProjectPage
          overwrittenClassNames={{
            inputControl: styles.inputControl,
            inputContainer: styles.inputContainer
          }}
        />
      )}
    </div>
  )
}
