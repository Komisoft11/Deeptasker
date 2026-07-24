import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  IWorkspaceCreateDto,
  useWorkspaces,
  workspaceSettingsSchema
} from '@/entities/Workspace'
import { Close, Plus } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { Button } from '@/shared/ui/Button/Button'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Input } from '@/shared/ui/Input/Input'
import { InvitePeopleInput } from '@/shared/ui/InvitePeopleInput/InvitePeopleInput'


interface Props {
  afterCreate: () => void
}

export const WorkspaceCreate = ({ afterCreate }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IWorkspaceCreateDto>({
    resolver: yupResolver(workspaceSettingsSchema),
    mode: 'onChange'
  })

  const { createAsync } = useWorkspaces()

  const { t } = useTranslation([TRANSLATION, ENTITY])

  const [emails, setEmails] = useState<string[]>([])

  async function createWorkspace(dto: IWorkspaceCreateDto) {
    const workspaceDto = {
      ...dto,
      emailInvitees: emails.length ? emails : undefined
    }
    await createAsync.mutateAsync(workspaceDto)
    afterCreate?.()
  }

  return (
    <form
      onSubmit={handleSubmit(createWorkspace)}
      className={'flex flex-col h-full justify-between'}
    >
      <div className={'flex flex-col gap-3'}>
        <HorizontalLayout
          labelText={t('workspace.name', { ns: ENTITY }) as string}
        >
          <Input
            {...register('title')}
            autoFocus
            error={!!errors.title?.message}
            helperText={errors.title?.message}
            placeholder={t('workspace.enterName', { ns: ENTITY }) as string}
            className={'max-w-[560px]'}
          />
        </HorizontalLayout>
        <HorizontalLayout
          labelText={t('workspace.addAdmins', { ns: ENTITY }) as string}
          labelDescription={t('canDoLaterNote', { ns: TRANSLATION }) as string}
        >
          <InvitePeopleInput
            emails={emails}
            setEmails={setEmails}
            className={'max-w-[560px]'}
            isExistingEmailsCheckNeeded={false}
          />
        </HorizontalLayout>
        {emails.length ? (
          <div className={'flex gap-2 w-full flex-wrap'}>
            {emails.map((email, index) => (
              <div
                className={'flex gap-2 pl-2 rounded-lg bg-hover items-center'}
                key={index}
              >
                <p className={'body-14-16 '}>{email}</p>
                <div
                  className={'iconContainer'}
                  onClick={() =>
                    setEmails((prevEmails) =>
                      prevEmails.filter((chosenEmail) => email !== chosenEmail)
                    )
                  }
                >
                  <Close className={'icon w-4 h-4'} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={'body-12 secondaryText w-full text-center'}>
            {t('workspace.invitedAdminsList', { ns: ENTITY })}
          </p>
        )}
      </div>

      <div className={'pt-6'}>
        <Button
          className={'px-4 body-16'}
          styleButton={'filled'}
          type={'submit'}
          icon={<Plus />}
          disabled={!isValid}
        >
          {t('workspace.create', { ns: ENTITY })}
        </Button>
      </div>
    </form>
  )
}
