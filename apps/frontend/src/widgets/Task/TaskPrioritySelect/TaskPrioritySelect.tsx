import classNames from 'classnames'
import React, { ReactNode, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styles from '@/features/Task/TaskPriority/TaskPriority.module.scss'
import {
  IPriorityOption,
  priorityOptions
} from '@/entities/Task/services/task-priorities'
import { hexToRgba } from '@/shared/lib/helpers/color/hexToRgb'
import { Select } from '@/shared/ui/Select/Select'


type Mode = 'regular' | 'minimum' | 'kanban'

interface Props {
  canChangePriority?: boolean
  disabled?: boolean
  currentPriority: IPriorityOption
  mode?: Mode
  className?: string
  changeSelectedPriority: (selectedPriorityId: string) => void
}

export const TaskPrioritySelect = ({
  canChangePriority = true,
  currentPriority,
  mode = 'regular',
  disabled = false,
  className,
  changeSelectedPriority
}: Props) => {
  const { t } = useTranslation()
  const renderPriority = useCallback(
    (priority: IPriorityOption) => (
      <div className={styles.item}>
        <div
          className={`w-4 h-4 rounded-full`}
          style={{
            backgroundColor:
              priority.value === 0 ? 'var(--hover)' : priority.colorBg
          }}
        />
        <p className={'body-14-16'}>{t(priority.label)}</p>
      </div>
    ),
    [t]
  )

  const renderKanbanPriority = useCallback(
    (priority: IPriorityOption) => (
      <div className={styles.kanbanItem}>
        <p
          className={classNames(
            mode === 'kanban' ? 'body-12' : 'body-14-16',
            priority.value === 0 && 'secondaryText'
          )}
        >
          {t(priority.label)}
        </p>
      </div>
    ),
    [t]
  )

  const componentsByMode: Record<Mode, ReactNode> = useMemo(
    () => ({
      regular: renderPriority(currentPriority),
      minimum: (
        <div
          className={classNames(`w-4 h-4 rounded-full`, styles.priority)}
          style={{
            backgroundColor:
              currentPriority.value === 0
                ? 'var(--hover)'
                : currentPriority.colorBg
          }}
        />
      ),
      kanban: renderKanbanPriority(currentPriority)
    }),
    [currentPriority, renderPriority, renderKanbanPriority]
  )

  const isKanban = mode === 'kanban'
  const isMinimum = mode === 'minimum'
  const isDisabled = !canChangePriority

  const triggerClasses = classNames(
    'py-2 px-3',
    isMinimum && 'border-none w-full justify-center flex h-full',
    isDisabled && 'disabled-70',
    className,
    isKanban && styles.kanbanSelect,
    isKanban && isDisabled && styles.kanbanSelectDisabled
  )

  const triggerStyle =
    isKanban && currentPriority.value !== 0
      ? {
          backgroundColor: hexToRgba(currentPriority.colorBg, 0.1),
          borderColor: currentPriority.colorBg
        }
      : undefined

  return (
    <Select
      disabled={disabled}
      value={currentPriority.value + ''}
      onValueChange={changeSelectedPriority}
    >
      <Select.Trigger
        className={triggerClasses}
        disabled={!canChangePriority}
        style={triggerStyle}
      >
        {componentsByMode[mode]}
      </Select.Trigger>
      <Select.Portal container={document.body}>
        <Select.Content
          data-no-dnd={true}
          style={{ width: 'max-content' }}
          viewportProps={{
            className: 'flex flex-col gap-1 w-[180px]'
          }}
        >
          {priorityOptions.map((priority) => (
            <Select.Item key={priority.value} value={priority.value + ''}>
              {renderPriority(priority)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  )
}
