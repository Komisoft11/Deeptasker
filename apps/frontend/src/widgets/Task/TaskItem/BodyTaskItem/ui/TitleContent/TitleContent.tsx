import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MAX_TITLE_LENGTH } from '@/widgets/Task/TaskItem/BodyTaskItem/const/taskConsts'
import { usePermissionTask } from '@/entities/Task'
import { ENTER, ESCAPE } from '@/shared/const/keyboardKeys'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'
import styles from './TitleContent.module.scss'


type Props = {
  value: string
  error: string
  isEditing: Boolean
  cancelEditing: () => void
  handleChange: (value: string) => void
  save: () => void
}

export const TitleContent = ({
  value,
  error,
  isEditing,
  cancelEditing,
  handleChange,
  save
}: Props) => {
  const {
    taskStore: { activeTask }
  } = useRootStore()

  const { canEditTitleTask } = usePermissionTask(activeTask)
  const { t } = useTranslation([TRANSLATION])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ENTER) {
      if (error) return
      e.preventDefault()
      save()
    }

    if (e.key === ESCAPE) {
      cancelEditing()
    }
  }
  return isEditing ? (
    <div className='flex flex-col gap-1 hover:cursor-pointer'>
      <Input
        autoFocus
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={classNames(
          styles.inputContainer,
          isEditing && styles.focused,
          error && styles.error
        )}
        containerClassName={'focus-within:!outline-none'}
        inputClassName={styles.input}
        disabled={!canEditTitleTask}
        maxLength={MAX_TITLE_LENGTH}
      >
        <div className={'flex gap-1'}>
          <KbdElement
            kdb={ESCAPE}
            tooltipContent={t('cancel', { ns: TRANSLATION })}
          />
          <KbdElement
            kdb={ENTER}
            tooltipContent={t('save', { ns: TRANSLATION })}
          />
        </div>
      </Input>
      {error && <p className='text-systemRed body-12'>{error}</p>}
    </div>
  ) : (
    <h2 className='border border-transparent break-all min-h-[31px]'>
      {value}
    </h2>
  )
}
