import classNames from 'classnames'
import React, { Dispatch, SetStateAction } from 'react'
import { RoleChange } from '@/features/User/UserTable/ui/RoleChange/RoleChange'
import { ProjectRole } from '@/entities/Project'
import { Close } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './InvitePeopleList.module.scss'

interface Props {
  emails: string[]
  setEmails: Dispatch<SetStateAction<string[]>>
  selectedRoles: Record<string, ProjectRole>
  setSelectedRoles: Dispatch<SetStateAction<Record<string, ProjectRole>>>
}

export const InvitePeopleList = ({
  emails,
  setEmails,
  selectedRoles,
  setSelectedRoles
}: Props) => {
  const {
    projectStore: { activeProject }
  } = useRootStore()

  const handleDelete = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email))

    setSelectedRoles((prev) => {
      const updated = { ...prev }
      delete updated[email]
      return updated
    })
  }

  const handleChangeRole = (email: string, role: ProjectRole) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [email]: role
    }))
  }

  return (
    <div
      className={classNames(
        styles.peopleContainer,
        'scrollbarContainerOnObjects'
      )}
    >
      {emails.map((email) => (
        <div
          key={email}
          className={
            'flex w-full justify-between py-1 border-b border-hover items-center'
          }
        >
          <p className={'body-14-16 p-3 w-full ellipsis'}>{email}</p>
          <div className={'flex gap-2 p-3'}>
            <RoleChange
              project={activeProject}
              value={selectedRoles[email] ?? 'user'}
              onChange={(role) => handleChangeRole(email, role)}
              triggerClassName={'bg-hover'}
              contentClassName={'z-11'}
            />
          </div>

          <div className={'iconContainer'} onClick={() => handleDelete(email)}>
            <Close className={'icon w-4 h-4'} />
          </div>
        </div>
      ))}
    </div>
  )
}
