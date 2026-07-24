import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import React, { FC, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { queryStaleTimeAdminsAndInvitees } from '@/widgets/Workspace/WorkspaceAdmins/const/const'
import { queryStaleTimeMembersAndInvitees } from '@/features/Project/ProjectMembers/const/const'
import { inviteSchema } from '@/entities/User/lib/inviteSchema'
import { queries } from '@/entities/lib/api/all-queries'
import { Close, Plus } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { CANCEL, CREATE } from '@/shared/lib/helpers/shortcut.helper'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { FooterButton } from '@/shared/ui/FooterButton/FooterButton'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'
import styles from './UserInviter.module.scss'


interface Props {
  onChange: (value: string) => void
  overwrittenClassNames: {
    inputControl: string
    inputContainer: string
  }
  isProjectPage: boolean
}

type FormValues = {
  email: string
}

const MAX_USERS = 10
const SAFE_USERS_AMOUNT = 5

export const UserInviter: FC<Props> = ({
  onChange,
  overwrittenClassNames,
  isProjectPage
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const {
    workspaceStore: { activeWorkspace },
    projectStore: { activeProject }
  } = useRootStore()

  const { t } = useTranslation([ENTITY, TRANSLATION])

  const [isShowInput, setIsShowInput] = useState<boolean>(false)

  const { data: admins } = useQuery({
    ...queries.workspace.admin(activeWorkspace),
    staleTime: queryStaleTimeAdminsAndInvitees
  })
  const { data: invitees } = useQuery({
    ...queries.workspace.invitees(activeWorkspace),
    staleTime: queryStaleTimeAdminsAndInvitees
  })
  const { data: members } = useQuery({
    ...queries.project.members(activeProject, activeWorkspace.id),
    staleTime: queryStaleTimeMembersAndInvitees
  })

  const { data: projectInvitees } = useQuery({
    ...queries.project.invitees(activeProject, activeWorkspace.id),
    staleTime: queryStaleTimeMembersAndInvitees
  })

  const existingEmails: string[] = isProjectPage
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

  const { getValues, control, reset } = useForm<FormValues>({
    resolver: yupResolver(inviteSchema(existingEmails)),
    mode: 'onChange'
  })

  const handleInvite = () => {
    if (control._formState.errors.email) {
      return
    }

    const { email } = getValues()

    onChange(email.trim() ?? '')
    setIsShowInput(false)
  }

  const handleCancel = () => {
    setIsShowInput(false)
    reset()
  }

  const handleClick = () => {
    setIsShowInput(!isShowInput)
    if (isShowInput) {
      reset()
    }
  }

  const safeMembers = members ?? []
  const safeProjectInvitees = projectInvitees ?? []
  const safeAdmins = admins ?? []
  const safeInvitees = invitees ?? []

  const totalUsers = isProjectPage
    ? safeMembers.length + safeProjectInvitees.length
    : safeAdmins.length + safeInvitees.length

  const isShowButton = totalUsers < MAX_USERS
  const isShowWarning = totalUsers > SAFE_USERS_AMOUNT

  useKeyDown(inputRef, handleInvite, CREATE)
  useKeyDown(inputRef, handleCancel, [CANCEL])

  return (
    <>
      {isShowInput && (
        <Controller
          control={control}
          name={'email'}
          render={({ field: { onChange }, formState: { errors } }) => (
            <div className={'flex flex-col px-4'}>
              <Input
                ref={inputRef}
                placeholder={
                  t('invitation.placeholder', { ns: ENTITY }) as string
                }
                className={`${overwrittenClassNames.inputControl} ${
                  errors.email
                    ? '!border-systemRed hover:!border-systemRed'
                    : ''
                }`}
                autoFocus
                containerClassName={classNames(
                  overwrittenClassNames.inputContainer,
                  styles.input
                )}
                onChange={onChange}
              >
                <KbdElement
                  kdb={'Enter'}
                  tooltipContent={t('invitation.inviteButton', { ns: ENTITY })}
                />
              </Input>
              {errors.email && (
                <p className={'body-12 text-systemRed p-3'}>
                  {errors.email.message}
                </p>
              )}
            </div>
          )}
        />
      )}
      {isShowButton ? (
        <FooterButton
          colorButton={'dark'}
          styleButton={'filled'}
          onClick={handleClick}
          buttonText={
            isShowInput
              ? t('cancel', { ns: TRANSLATION })
              : t('invitation.inviteButton', { ns: ENTITY })
          }
          Icon={isShowInput ? Close : Plus}
          className={'flex-col'}
        >
          {isShowWarning && (
            <p className={'body-12 secondaryText'}>
              {t('invitation.invitationRemaining', {
                ns: ENTITY,
                count: MAX_USERS - totalUsers
              })}
            </p>
          )}
        </FooterButton>
      ) : (
        <p
          className={
            'py-4 text-center secondaryText border-t border-border body-14-16 w-full bg-bg'
          }
        >
          {t('userLimitReached', { ns: TRANSLATION })}
        </p>
      )}
    </>
  )
}
