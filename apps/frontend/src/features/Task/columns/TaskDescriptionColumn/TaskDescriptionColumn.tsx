import classNames from 'classnames'
import React, { ChangeEvent, FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { stripHtml } from 'string-strip-html'
import { Task, usePermissionTask, useTasks } from '@/entities/Task'
import { Plus } from '@/shared/assets/images/icons'
import { CANCEL, CREATE } from '@/shared/lib/helpers/shortcut.helper'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'


interface Props {
  task: Task
}

export const TaskDescriptionColumn: FC<Props> = ({ task }) => {
  const { t } = useTranslation()
  const [isAddDescription, setIsAddDescription] = useState(false)

  const { updateAsync } = useTasks()

  const [textAreaValue, setTextAreaValue] = useState<string>('')

  const { canEditDescriptionTask } = usePermissionTask(task)

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaValue(e.target.value)
  }

  const handleEnter = async () => {
    const isInputEmpty: boolean = !textAreaValue && !textAreaValue.length
    const isInputOnlySpace: boolean = !textAreaValue.replaceAll(' ', '').length

    if (!isInputEmpty && !isInputOnlySpace) {
      await updateAsync.mutateAsync({
        id: task.id,
        dto: { content: `<p>${textAreaValue}</p>` }
      })

      setIsAddDescription(false)
    }
  }

  const handleCancel = () => {
    setIsAddDescription(false)
    setTextAreaValue(description)
  }

  const startEditing = () => {
    setIsAddDescription(true)
    setTextAreaValue(description)
  }

  const description = stripHtml(task.content).result

  const ref = useRef<HTMLTextAreaElement>(null)

  useKeyDown(ref, handleEnter, CREATE)
  useKeyDown(ref, handleCancel, [CANCEL])

  const renderContent = () => {
    if (isAddDescription && canEditDescriptionTask) {
      return (
        <textarea
          ref={ref}
          className={classNames(
            'p-2 pr-0 bg-objects rounded-lg resize-none border',
            'min-h-[80px] body-12 scrollbarContainerOnObjects w-full'
          )}
          autoFocus
          value={textAreaValue}
          onChange={handleTextareaChange}
          onBlur={handleEnter}
          placeholder={t('task.info.addDescription') as string}
        />
      )
    }

    if (description) {
      return (
        <div
          className={'hover:bg-hover hover:cursor-pointer p-2 rounded-lg'}
          onClick={() => startEditing()}
        >
          <p className='body-12 line-clamp-2 w-full break-all'>{description}</p>
        </div>
      )
    }

    if (canEditDescriptionTask) {
      return (
        <div
          className='iconContainer flex gap-1'
          onClick={() => startEditing()}
        >
          <Plus className='icon w-4 h-4' />
          <p className='secondaryText body-12'>
            {t('task.info.addDescription') as string}
          </p>
        </div>
      )
    }

    return (
      <p className='border border-hover p-3 rounded-lg cursor-not-allowed'>
        {t('task.info.addDescription')}
      </p>
    )
  }
  return <>{renderContent()}</>
}
