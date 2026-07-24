import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { queryStaleTimeAdminsAndInvitees } from '@/widgets/Workspace/WorkspaceAdmins/const/const'
import { queryStaleTimeMembersAndInvitees } from '@/features/Project/ProjectMembers/const/const'
import { emailRegexp } from '@/entities/User/const/const'
import { queries } from '@/entities/lib/api/all-queries'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'


interface Props {
  className?: string
  emails: string[]
  setEmails: Dispatch<SetStateAction<string[]>>
  isProjectCreate?: boolean
  isExistingEmailsCheckNeeded?: boolean
}

export const InvitePeopleInput = ({
  className,
  emails,
  setEmails,
  isProjectCreate = false,
  isExistingEmailsCheckNeeded = true
}: Props) => {
  const [isFocused, setIsFocused] = useState(false)
  const [emailError, setEmailError] = useState('')
  const { t } = useTranslation(TRANSLATION)

  const {
    authStore: { user },
    workspaceStore: { activeWorkspace },
    projectStore: { activeProject }
  } = useRootStore()

  const { data: admins } = useQuery({
    ...queries.workspace.admin(activeWorkspace),
    staleTime: queryStaleTimeAdminsAndInvitees,
    enabled: !isProjectCreate
  })
  const { data: invitees } = useQuery({
    ...queries.workspace.invitees(activeWorkspace),
    staleTime: queryStaleTimeAdminsAndInvitees,
    enabled: !isProjectCreate
  })

  const { data: members } = useQuery({
    ...queries.project.members(activeProject, activeWorkspace.id),
    staleTime: queryStaleTimeMembersAndInvitees,
    enabled: !isProjectCreate
  })

  const { data: projectInvitees } = useQuery({
    ...queries.project.invitees(activeProject, activeWorkspace.id),
    staleTime: queryStaleTimeMembersAndInvitees,
    enabled: !isProjectCreate
  })

  const existingEmails: string[] = !isProjectCreate
    ? [
        ...(members ? members.map((member) => member.email) : []),
        ...(projectInvitees
          ? projectInvitees.map((invitee) => invitee.email)
          : [])
      ]
    : [
        ...(admins ? admins.map((admin) => admin.email) : []),
        ...(invitees ? invitees.map((invitee) => invitee.email) : [])
      ]

  const isValidEmail = (email: string) => {
    return emailRegexp.test(email)
  }

  const handleEmailInputChange = (value: string) => {
    if (!value.trim()) {
      setEmailError('')
      return
    }

    if (!isValidEmail(value)) {
      setEmailError('Введите корректный email')
      return
    }

    if (emails.includes(value.trim())) {
      setEmailError('Этот email уже добавлен')
      return
    }

    if (user.email === value.trim()) {
      setEmailError('Нельзя пригласить себя')
      return
    }

    if (isExistingEmailsCheckNeeded && existingEmails.includes(value.trim())) {
      setEmailError('Этот пользователь уже приглашен')
      return
    }

    setEmailError('')
  }

  const handleEmailInput = (
    event: React.KeyboardEvent<HTMLInputElement>,
    value: string
  ) => {
    if (event.key === 'Enter' && value.trim()) {
      event.preventDefault()
      if (value.trim().length && !emailError) {
        setEmails((prev) => [...prev, value.trim()])
        event.currentTarget.value = ''
      }
    }
  }

  return (
    <div className={classNames('flex flex-col gap-1  w-full', className)}>
      <Input
        placeholder={t('inviteEmailInput') as string}
        onKeyDown={(e) => handleEmailInput(e, e.currentTarget.value)}
        onChange={(e) => handleEmailInputChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {isFocused && !emailError && (
          <KbdElement kdb={'Enter'} tooltipContent={'Добавить почту'} />
        )}
      </Input>
      {emailError && (
        <p className={'body-12 text-systemRed pl-3'}>{emailError}</p>
      )}
    </div>
  )
}
