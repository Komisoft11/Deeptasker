import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '@/features/User'
import { RoleChange } from '@/features/User/UserTable/ui/RoleChange/RoleChange'
import { Project, usePermissionProject } from '@/entities/Project'
import { IUser } from '@/entities/User'
import { UserService } from '@/entities/User/services/user.service'
import { workspaceQueries } from '@/entities/Workspace/api/workspace'
import { AdminInviteesDTO } from '@/entities/Workspace/model/types/workspace.interface'
import { Close, Email, Gear } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { copyTextToClipboard } from '@/shared/lib/helpers/copyTextToClipboard'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Table } from '@/shared/ui/Table/Table'
import { createColumnHelper } from '@/shared/ui/Table/lib/createColumnHelper'
import styles from './UserTable.module.scss'


interface Props {
  setSelectedUser: (user: IUser) => void
  isOwner: (user: IUser) => boolean
  isYou: (user: IUser) => boolean
  users?: IUser[]
  invitees?: AdminInviteesDTO[]
  isProjectPage?: boolean
  project?: Project
  cancelInvite: (value: string) => void
}

export const UserTable = observer(
  ({
    setSelectedUser,
    isOwner,
    isYou,
    users,
    invitees,
    project,
    cancelInvite,
    isProjectPage = false
  }: Props) => {
    const columnHelper = createColumnHelper<IUser>()
    const {
      authStore: { user: currentUser },
      workspaceStore: { activeWorkspace }
    } = useRootStore()

    const { t } = useTranslation([ENTITY])

    const {
      permissions: { manageAdmins: canEditRole }
    } = usePermissionProject()

    const { data: admins } = useQuery(workspaceQueries.admin(activeWorkspace))

    const canMailUser =
      isOwner(currentUser) ||
      currentUser.isAdmin ||
      currentUser.projectRole === 'admin'

    const columns = [
      columnHelper.accessor({
        id: 'name',
        header: () => <p>{t('user.fullName')}</p>,
        cell: (user) => {
          const isUserWorkspaceAdmin = admins?.some(
            (admin) => admin.id === user.id
          )

          const badges: string[] = []

          if (isYou(user)) badges.push(t('user.you'))
          if (isOwner(user)) badges.push(t('user.owner'))
          if (isUserWorkspaceAdmin && isProjectPage && !isYou(user))
            badges.push(t('user.workspaceAdmin'))

          return (
            <div className={'flex gap-2 items-center w-full'}>
              <UserAvatar user={user} className={'shrink-0'} />
              <div className={'flex flex-col gap-1 w-full'}>
                <p className={'ellipsis w-[calc(100%-32px)]'}>
                  {UserService.getFullName(user)}
                </p>
                <div className='flex gap-1'>
                  {badges.map((b, i) => (
                    <span key={i} className='secondaryText body-12'>
                      {b}
                      {i < badges.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor({
        id: 'email',
        header: () => `${t('user.username')}`,
        cell: (user) => (
          <p
            onClick={() => copyTextToClipboard(user.username)}
            className={
              'p-2 bg-objects rounded-lg hover:bg-hover hover:cursor-pointer'
            }
          >
            {user.username}
          </p>
        )
      }),
      ...(isProjectPage
        ? [
            columnHelper.accessor({
              id: 'role',
              header: () => `${t('user.role')}`,
              cell: (user) => {
                const isUserWorkspaceAdmin = admins?.some(
                  (admin) => admin.id === user.id
                )

                const isRoleChangeDisabled =
                  isOwner(user) ||
                  isYou(user) ||
                  !canEditRole ||
                  isUserWorkspaceAdmin

                return (
                  <RoleChange
                    user={user}
                    project={project as Project}
                    disabled={isRoleChangeDisabled}
                    triggerClassName='bg-objects p-2'
                  />
                )
              }
            })
          ]
        : []),
      columnHelper.accessor({
        id: 'actions',
        header: () => '',
        cell: (user) => (
          <div className={'flex gap-1 justify-end w-full items-center'}>
            {canMailUser && (
              <a href={`mailto:${user.email}`} className={styles.iconWrap}>
                <Email />
              </a>
            )}
            {(isProjectPage
              ? project?.user.id != user.id
              : activeWorkspace.user?.id != user.id) && (
              <div className={styles.iconWrap}>
                <Gear onClick={() => setSelectedUser(user)} />
              </div>
            )}
          </div>
        )
      })
    ]

    return (
      <div className={styles.list}>
        <Table className={'body-14-16'}>
          <Table.Head>
            <Table.Row
              className={classNames(
                styles.tableRowHeader,
                isProjectPage && styles.projectTableRow
              )}
            >
              {columns.map((c) => (
                <Table.Cell
                  key={c.id}
                  style={{
                    width: c.size,
                    minWidth: c.minSize,
                    maxWidth: c.maxSize
                  }}
                >
                  {c.header()}
                </Table.Cell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body className={'flex flex-col overflow-y-auto'}>
            {users?.map((user) => (
              <Table.Row
                className={classNames(
                  styles.tableRow,
                  isProjectPage && styles.projectTableRow
                )}
                key={user?.id}
              >
                {columns.map((c) => {
                  return (
                    <Table.Cell
                      style={{
                        width: c.size,
                        minWidth: c.minSize,
                        maxWidth: c.maxSize
                      }}
                      key={c.id}
                    >
                      {c.cell(user)}
                    </Table.Cell>
                  )
                })}
              </Table.Row>
            ))}
            {invitees?.map((dto, index) => (
              <Table.Row
                className={classNames(
                  'grid-cols-1',
                  isProjectPage && styles.projectTableRow
                )}
                key={index}
              >
                <div
                  className={
                    'w-full px-3 py-6 flex justify-between items-center'
                  }
                >
                  <p className={'secondaryText body-14-16'}>
                    {t('invitation.invitationSent', { email: dto.email })}
                  </p>
                  {dto.senderId === currentUser.id && (
                    <div
                      className={'iconContainer'}
                      onClick={() => cancelInvite(dto.email)}
                    >
                      <Close className={'icon w-4 h-4'} />
                    </div>
                  )}
                </div>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    )
  }
)
