import { useQuery } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { queryStaleTimeAdminsAndInvitees } from '@/widgets/Workspace/WorkspaceAdmins/const/const'
import { UserInviter } from '@/features/User'
import { UserTable } from '@/features/User/UserTable/UserTable'
import styles from '@/features/User/UserTable/UserTable.module.scss'
import { UserProfileWorkspace } from '@/features/Workspace/UserProfileWorkspace/UserProfileWorkspace'
import { IUser } from '@/entities/User'
import { useWorkspaces } from '@/entities/Workspace'
import { usePermissionWorkspace } from '@/entities/Workspace/model/PermissionWorkspace'
import { queries } from '@/entities/lib/api/all-queries'
import { RouterParams } from '@/shared/config/route.config'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { WorkspacesNavigator } from '@/shared/lib/navigators/worksapce.navigator'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs/Breadcrumbs'
import { IBreadcrumb } from '@/shared/ui/Breadcrumbs/type/breadcrumbs.interface'
import { Dialog } from '@/shared/ui/Dialog/Dialog'


export const WorkspaceAdmins = observer(() => {
  const { workspaceStore } = useRootStore()
  const { workspaceId } = useParams<RouterParams>()
  const workspace = workspaceStore.get(Number(workspaceId))
  const { t } = useTranslation([ENTITY, TRANSLATION])

  const [selectedUser, setSelectedUser] = useState<IUser>()

  const { inviteAdminAsync, cancelInviteAdminAsync } = useWorkspaces()
  const { canManageAdmins } = usePermissionWorkspace(workspace)
  const { data: admins } = useQuery({
    ...queries.workspace.admin(workspace),
    staleTime: queryStaleTimeAdminsAndInvitees
  })
  const { data: invitees } = useQuery({
    ...queries.workspace.invitees(workspace),
    staleTime: queryStaleTimeAdminsAndInvitees
  })

  const handleAddAdmin = async (value: string) => {
    if (!value.length) return

    await inviteAdminAsync.mutateAsync({
      workspace,
      email: value,
      senderId: currentUser.id
    })
  }

  const handleCancelInvite = async (value: string) => {
    await cancelInviteAdminAsync.mutateAsync({
      workspace,
      email: value,
      senderId: currentUser.id
    })
  }

  const currentUser = LocalStorageHelper.getUser()
  const isYou = (user: IUser) => user.id === currentUser.id
  const isOwner = (user: IUser) => workspace.user.id === user.id

  const breadcrumbs: IBreadcrumb[] = [
    {
      id: 'ws main',
      title: t('workspace.title', { ns: ENTITY }),
      url: WorkspacesNavigator.getWorkspaceGridUrl(
        workspaceStore.activeWorkspace.id
      )
    },
    {
      id: `ws settings`,
      title: t('setting', { ns: TRANSLATION }),
      url: WorkspacesNavigator.getWorkspaceUrlWithId({
        currentWorkspaceId: workspaceStore.activeWorkspace.id,
        workspaceId: workspace.id,
        tab: 'setting'
      })
    },
    {
      id: `ws`,
      title: workspaceStore.activeWorkspace.title,
      url: WorkspacesNavigator.getWorkspaceUrlWithId({
        currentWorkspaceId: workspaceStore.activeWorkspace.id,
        workspaceId: workspace.id
      })
    },
    {
      id: `ws admins`,
      title: t('admins', { ns: TRANSLATION }),
      url: WorkspacesNavigator.getWorkspaceUrlWithId({
        currentWorkspaceId: workspaceStore.activeWorkspace.id,
        workspaceId: workspace.id,
        tab: 'admins'
      })
    }
  ]

  return (
    <div className={'flex flex-col gap-3 flex-[1_0_0]'}>
      <UserTable
        setSelectedUser={setSelectedUser}
        isOwner={isOwner}
        isYou={isYou}
        users={admins}
        invitees={invitees}
        cancelInvite={handleCancelInvite}
      />
      {canManageAdmins && (
        <UserInviter
          onChange={handleAddAdmin}
          isProjectPage={false}
          overwrittenClassNames={{
            inputControl: styles.inputControl,
            inputContainer: styles.inputContainer
          }}
        />
      )}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(value) => !value && setSelectedUser(undefined)}
      >
        <Dialog.Content title={<Breadcrumbs breadcrumbs={breadcrumbs} />}>
          {selectedUser && (
            <UserProfileWorkspace
              setSelectedUser={setSelectedUser}
              user={selectedUser}
              workspace={workspace}
            />
          )}
        </Dialog.Content>
      </Dialog>
    </div>
  )
})
