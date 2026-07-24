import React, { ChangeEvent, FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InvitePeopleList } from '@/widgets/Project/InvitePeopleList/InvitePeopleList'
import { ICreateProjectDTO, ProjectRole } from '@/entities/Project'
import useProjects from '@/entities/Project/lib/hooks/useProjects'
import { Plus } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Input } from '@/shared/ui/Input/Input'
import { InvitePeopleInput } from '@/shared/ui/InvitePeopleInput/InvitePeopleInput'


interface Props {
  afterCreate?: () => void
}

export const ProjectBlankCreator: FC<Props> = ({ afterCreate }) => {
  const [title, setTitle] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<
    Record<string, ProjectRole>
  >({})
  const [titleError, setTitleError] = useState('')
  const {
    authStore: { user },
    workspaceStore: { activeWorkspace }
  } = useRootStore()

  const { t } = useTranslation([TRANSLATION, ENTITY])

  const { createAsync } = useProjects()

  const isDisabled = Boolean(title.length && title.length < 3)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setTitle(value)

    const error =
      value.length > 0 && value.length < 3
        ? 'Название проекта должно содержать не менее 3 символов'
        : ''

    setTitleError(error)
  }

  const createProject = async (workspaceId: number) => {
    const usersToInvite = emails.map((email) => ({
      email,
      role: selectedRoles[email] || 'user',
      senderId: user.id
    }))

    const titleToSend =
      title.length > 0 ? title : (t('project.new', { ns: ENTITY }) as string)

    const dtoWithInvites: ICreateProjectDTO = {
      workspaceId: workspaceId,
      title: titleToSend,
      slug: titleToSend,
      settings: {
        isReviewRequired: false
      },
      invitees: usersToInvite
    }

    await createAsync.mutateAsync(dtoWithInvites)
    afterCreate?.()
  }

  return (
    <div className={'w-full h-full flex flex-col justify-between'}>
      <div className={'flex flex-col gap-3 h-full'}>
        <HorizontalLayout labelText={t('project.name', { ns: ENTITY })}>
          <Input
            autoFocus={true}
            className={'max-w-[560px]'}
            placeholder={t('project.enterName', { ns: ENTITY }) as string}
            value={title}
            onChange={handleChange}
            error={Boolean(titleError)}
            helperText={titleError}
          />
        </HorizontalLayout>
        <HorizontalLayout
          labelText={t('project.invitePeople', { ns: ENTITY })}
          labelDescription={t('canDoLaterNote', { ns: TRANSLATION }) as string}
        >
          <InvitePeopleInput
            emails={emails}
            setEmails={setEmails}
            className={'max-w-[560px]'}
            isProjectCreate
          />
        </HorizontalLayout>
        {emails.length > 0 ? (
          <InvitePeopleList
            emails={emails}
            setEmails={setEmails}
            selectedRoles={selectedRoles}
            setSelectedRoles={setSelectedRoles}
          />
        ) : (
          <p className={'secondaryText body-12 w-full text-center'}>
            {t('project.invitedPeopleList', { ns: ENTITY })}
          </p>
        )}
      </div>

      <div className={'pt-6'}>
        <Button
          styleButton={'filled'}
          type={'button'}
          className={'px-4 body-14-16'}
          icon={<Plus />}
          onClick={() => createProject(activeWorkspace.id)}
          disabled={isDisabled}
        >
          {t('project.create', { ns: ENTITY })}
        </Button>
      </div>
    </div>
  )
}
