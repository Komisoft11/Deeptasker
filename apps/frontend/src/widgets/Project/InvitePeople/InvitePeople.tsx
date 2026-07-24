import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InvitePeopleList } from '@/widgets/Project/InvitePeopleList/InvitePeopleList'
import { ProjectRole, useProjects } from '@/entities/Project'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { InvitePeopleInput } from '@/shared/ui/InvitePeopleInput/InvitePeopleInput'


interface Props {
  setOpenDialog: (open: 'task' | 'invite' | null) => void
}

export const InvitePeople = ({ setOpenDialog }: Props) => {
  const [emails, setEmails] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<
    Record<string, ProjectRole>
  >({})
  const { inviteMultipleMembersAsync } = useProjects()
  const { t } = useTranslation([ENTITY, TRANSLATION])

  const {
    projectStore: { activeProject },
    authStore: { user }
  } = useRootStore()

  const handleSave = () => {
    const usersToInvite = emails.map((email) => ({
      email: email,
      role: selectedRoles[email] || 'user',
      senderId: user.id
    }))

    inviteMultipleMembersAsync.mutate({
      project: activeProject,
      invitees: usersToInvite
    })
    setOpenDialog(null)
  }

  return (
    <div className={'flex flex-col gap-4 h-full'}>
      <div className='flex flex-col gap-6 border-b border-hover pb-6'>
        <p className='secondaryText body-12 max-w-[480px] w-full'>
          {t('project.invitePeopleText', { ns: ENTITY })}
        </p>

        <InvitePeopleInput emails={emails} setEmails={setEmails} />
      </div>

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
      {emails.length > 0 && (
        <Button
          styleButton={'filled'}
          className={'max-w-[120px] w-full body-16'}
          onClick={handleSave}
        >
          {t('save', { ns: TRANSLATION })}
        </Button>
      )}
    </div>
  )
}
