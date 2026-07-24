import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { alwaysDisabledListKeys } from '@/features/Project/PermissionCheckboxes/const/permissions'
import { roles } from '@/features/User/UserTable/const/roles'
import {
  IPermissionProject,
  IProjectPermissionRole,
  Project,
  ProjectRole,
  defaultProjectRolesPermissions,
  usePermissionProject,
  useProjects
} from '@/entities/Project'
import { IUser } from '@/entities/User'
import { queries } from '@/entities/lib/api/all-queries'
import { ENTITY } from '@/shared/const/translation'
import { Select } from '@/shared/ui/Select/Select'

interface Props {
  user?: IUser
  project: Project
  disabled?: boolean
  value?: ProjectRole
  onChange?: (role: ProjectRole) => void
  triggerClassName?: string
  contentClassName?: string
}

export const RoleChange = observer(
  ({
    user,
    project,
    disabled = false,
    value,
    onChange,
    triggerClassName,
    contentClassName
  }: Props) => {
    const actualRole = value ?? usePermissionProject(project, user).role
    const ql = useQueryClient()
    const { changePermissionsAsync } = useProjects()
    const { t } = useTranslation()

    const current = roles.find((r) => r.key === actualRole)
    const CurrentIcon = current?.Icon

    const handleChangeRole = (selectedRole: ProjectRole) => {
      if (!value && user) {
        const cleanedPermissions = Object.fromEntries(
          Object.entries(defaultProjectRolesPermissions[selectedRole]).filter(
            ([key]) =>
              !alwaysDisabledListKeys.includes(key as keyof IPermissionProject)
          )
        ) as IPermissionProject

        changePermissionsAsync.mutate(
          [
            user,
            project,
            {
              role: selectedRole,
              projectId: project.id,
              permissions: cleanedPermissions
            }
          ],
          {
            onSuccess: (_, params) => {
              ql.setQueryData<IProjectPermissionRole>(
                queries.user.permissionsProject(project, user).queryKey,
                () => ({
                  ...params[2]
                })
              )
            }
          }
        )
      } else {
        onChange?.(selectedRole)
      }
    }

    return (
      <Select value={actualRole} onValueChange={handleChangeRole}>
        <Select.Trigger
          placeholder={t('user.role', { ns: ENTITY })}
          className={classNames(
            'flex gap-1 body-14-16',
            disabled && 'bg-transparent disabled',
            triggerClassName
          )}
          disabled={disabled}
        >
          {CurrentIcon && <CurrentIcon className='w-4 h-4 icon' />}
          {t(`project.roles.${actualRole}`)}
        </Select.Trigger>
        <Select.Portal container={document.body}>
          <Select.Content
            className={classNames('w-[312px] max-h-max', contentClassName)}
            viewportClassName={'flex flex-col gap-1'}
          >
            {roles.map(({ key, Icon, description }) => (
              <Select.Item
                value={key}
                key={key}
                className={'flex gap-2 justify-start'}
                isComplex
              >
                <div>
                  <Icon className={'icon w-4 h-4'} />
                </div>

                <div className={'flex flex-col gap-1'}>
                  <p className={'body-14-16'}>{t(`project.roles.${key}`)}</p>
                  <p className={'secondaryText body-12'}>
                    {t(`project.rolesDescription.${description}`)}
                  </p>
                </div>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
    )
  }
)
