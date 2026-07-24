import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LabelWithPopover } from '@/widgets/Task/TaskItem/SidebarTaskItem/ui/LabelWithPopover/LabelWIthPopover'
import styles from '@/widgets/Task/TaskItem/SidebarTaskItem/ui/TaskSection/TaskSection.module.scss'
import { useTasks } from '@/entities/Task'
import { ENTITY } from '@/shared/const/translation'
import { formatTimeFromSeconds } from '@/shared/helpers/dates/formatTimeFromSeconds'
import { CANCEL } from '@/shared/lib/helpers/shortcut.helper'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'


interface Props {
  disabled?: boolean
}

export const TimeColumn: FC<Props> = observer(({ disabled = false }) => {
  const {
    taskStore: { activeTask }
  } = useRootStore()
  const { t } = useTranslation([ENTITY])

  const [approximateTime, setApproximateTime] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const ref = useRef<HTMLInputElement>(null)

  const { updateAsync } = useTasks()
  const totalSeconds = activeTask.totalSecondsTracked

  const handleApproximateTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim()
    const hours = parseInt(inputValue, 10)

    if (!inputValue || isNaN(hours)) {
      setError('Введите корректное значение')
      setApproximateTime('')
    } else if (hours <= 0) {
      setError('Оценка времени должна быть больше 0 часов')
      setApproximateTime('')
    } else {
      setError('')
      setApproximateTime(inputValue)
    }
  }

  const handleBlur = () => {
    if (!error && approximateTime) {
      setApproximateTime((prev) => `${prev} ч.`)
      setIsEditing(false)
    }
  }

  const handleFocus = () => {
    setIsEditing(true)
    setApproximateTime((prev) => prev.replace(' ч.', ''))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !error) {
      e.preventDefault()

      const hours = parseInt(approximateTime.replace(' ч.', ''), 10)
      if (hours > 0) {
        const totalSeconds = hours * 3600

        if (activeTask.estimatedTime !== totalSeconds) {
          updateAsync.mutate({
            id: activeTask.id,
            dto: {
              estimatedTime: totalSeconds
            }
          })
        }

        setApproximateTime(`${hours} ч.`)
        setIsEditing(false)
      }
    }
  }

  const handleClick = () => {
    if (!isDisabled) {
      setIsEditing(true)
    }
  }

  useEffect(() => {
    if (activeTask.estimatedTime) {
      const hours = Math.floor(activeTask.estimatedTime / 3600)
      setApproximateTime(`${hours} ч.`)
    }
  }, [activeTask.estimatedTime])

  const hasTrackedSeconds = activeTask.totalSecondsTracked > 0

  const isDisabled = Boolean(disabled || activeTask.dateFinished)

  useKeyDown(ref, handleBlur, [CANCEL])

  return (
    <div className='flex gap-3 w-full'>
      <LabelWithPopover
        label={t('task.info.timeEstimate', { ns: ENTITY })}
        className={styles.fullWidth}
      >
        {isEditing ? (
          <div className='flex flex-col gap-1 w-full'>
            <Input
              type='text'
              maxLength={3}
              value={approximateTime}
              autoFocus
              onChange={handleApproximateTimeChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className='body-12'
              onKeyDown={handleKeyDown}
              placeholder='Введите время в часах'
              disabled={isDisabled}
              ref={ref}
            >
              {isEditing && (
                <KbdElement kdb={'Enter'} tooltipContent={'Добавить время'} />
              )}
            </Input>
            {error && <p className='body-12 text-systemRed'>{error}</p>}
          </div>
        ) : (
          <p
            onClick={handleClick}
            className={classNames(
              'p-3 rounded-lg body-14-16 bg-hover hover:cursor-pointer',
              isDisabled &&
                'bg-transparent border border-border hover:cursor-not-allowed',
              !approximateTime && 'secondaryText'
            )}
          >
            {approximateTime ? approximateTime : 'Введите время в часах'}
          </p>
        )}
      </LabelWithPopover>

      {activeTask.dateFinished && hasTrackedSeconds && (
        <LabelWithPopover
          label={t('task.info.timeSpent', { ns: ENTITY })}
          className={styles.fullWidth}
        >
          <p className='h-10 w-full flex items-center body-12'>
            {formatTimeFromSeconds(totalSeconds)}
          </p>
        </LabelWithPopover>
      )}
    </div>
  )
})
