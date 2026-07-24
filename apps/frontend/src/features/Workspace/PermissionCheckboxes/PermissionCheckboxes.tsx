import { useQuery, useQueryClient } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import { FC, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IUser } from '@/entities/User'
import { IPermissionWorkspace, useWorkspaces, Workspace } from '@/entities/Workspace'
import { queries } from '@/entities/lib/api/all-queries'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { Loading } from '@/shared/ui/Loading/Loading'
import { Switch, SwitchProps } from '@/shared/ui/Switch/Switch'

interface Props {
  workspace: Workspace
  user: IUser
}

export const PermissionCheckboxes: FC<Props> = observer(
  ({ user, workspace }) => {
    const checkboxes: Record<
      'project' | 'workspace',
      Array<keyof IPermissionWorkspace>
    > = {
      workspace: ['edit', 'manageAdmins', 'delete'],
      project: ['editProjects', 'createProjects', 'deleteProjects']
    }

    const { changePermissionsAsync } = useWorkspaces()

    const { data: permissions, isLoading } = useQuery({
      ...queries.user.permissionsWorkspace(workspace, user),
      staleTime: 1_000 * 60 * 10
    })

    const queryClient = useQueryClient()

    const handleChange = (
      key: keyof IPermissionWorkspace,
      checked: boolean
    ) => {
      changePermissionsAsync.mutate(
        {
          workspace,
          user,
          permissions: {
            [key]: checked
          }
        },
        {
          onSuccess: (_, params) =>
            queryClient.setQueryData<IPermissionWorkspace>(
              queries.user.permissionsWorkspace(workspace, user).queryKey,
              (old) => ({
                ...old,
                ...params.permissions
              })
            )
        }
      )
    }

    const { t } = useTranslation()

    if (isLoading) {
      return <Loading variant={'spinner'} />
    }

    const isUserWorkspaceOwner = workspace.user.id === user.id
    const isCurrentUserWorkspaceOwner =
      workspace.user.id === LocalStorageHelper.getUser().id

    return (
      <div className={'flex gap-3 '}>
        <div className={'flex flex-col rounded-xl p-4 gap-2 bg-hover w-1/2'}>
          <h3 className={'pb-3 border-b border-hover'}>Рабочие пространство</h3>
          {checkboxes.workspace.map((key) => (
            <PermissionCheckbox
              onCheckedChange={(value) => handleChange(key, value)}
              description={t('workspace.permissions.' + key)}
              key={key}
              checked={permissions![key]}
              disabled={!isCurrentUserWorkspaceOwner}
            />
          ))}
        </div>

        <div className={'flex flex-col rounded-xl p-4  gap-2 bg-hover w-1/2'}>
          <h3 className={'pb-3 border-b border-hover'}>Проект</h3>
          {checkboxes.project.map((key) => (
            <PermissionCheckbox
              onCheckedChange={(value) => handleChange(key, value)}
              description={t('workspace.permissions.' + key)}
              key={key}
              checked={permissions![key]}
              disabled={!isCurrentUserWorkspaceOwner}
            />
          ))}
        </div>
      </div>
    )
  }
)

interface PermissionCheckboxProps extends SwitchProps {
  description: string
}

const PermissionCheckbox = forwardRef<
  HTMLButtonElement,
  PermissionCheckboxProps
>(({ description, ...props }, ref) => {
  return (
    <div className='flex items-center justify-between py-2 cursor-pointer select-none rounded-lg'>
      <Switch
        {...props}
        label={description}
        containerClassName={
          'flex w-full items-center justify-between cursor-pointer'
        }
        labelClassName={'body-16'}
      />
    </div>
  )
})