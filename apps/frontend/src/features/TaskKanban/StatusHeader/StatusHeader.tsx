import { UniqueIdentifier } from '@dnd-kit/core'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  KanbanContainer,
  KanbanItem
} from '@/widgets/KanbanPlanner/types/KanbanItem.interface'
import { AdditionalActionsPopover } from '@/widgets/KanbanPlanner/ui/AdditionalActionsPopover/AdditionalActionsPopover'
import {
  ITaskStatus,
  usePermissionProject,
  useProjects
} from '@/entities/Project'
import { Task } from '@/entities/Task'
import { Close, Drag, Plus } from '@/shared/assets/images/icons'
import { ENTER } from '@/shared/const/keyboardKeys'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'
import styles from './StatusHeader.module.scss'

interface Props {
  id: UniqueIdentifier
  isAddTask: boolean
  setIsAddTask: (isAddTask: boolean) => void
  handleProps?: React.HTMLAttributes<any>
  isDragOverlay: boolean
  isHovered: boolean
  onRemoveContainer?: () => void
  onDuplicateContainer?(tasks: Task[], status: ITaskStatus): void
  onMoveItems?(
    fromContainer: KanbanContainer,
    toContainer: KanbanContainer
  ): void
  items: KanbanItem[]
}

export const StatusHeader = observer(
  ({
    id,
    isAddTask,
    setIsAddTask,
    handleProps,
    isDragOverlay,
    isHovered,
    onRemoveContainer,
    onDuplicateContainer,
    onMoveItems,
    items
  }: Props) => {
    const { projectStore } = useRootStore()

    const { activeProject } = projectStore

    const [isEditStatusTitle, setIsEditStatusTitle] = useState(false)

    const [titleErrors, setTitleErrors] = useState<string | null>('')

    const status = projectStore.getStatusById(id as number)

    const { updateTaskStatusAsync } = useProjects()
    const { t } = useTranslation()
    const {
      permissions: { createTasks: canCreateTasks }
    } = usePermissionProject(activeProject)

    const [newTitle, setNewTitle] = useState('')

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim()
      const lowercasedValue = value.toLowerCase()

      if (value.length < 3) {
        setTitleErrors('Название доски должно быть больше 3-x символов')
      } else if (lowercasedValue === status.name.trim().toLowerCase()) {
        setTitleErrors('Новое название не должно совпадать с текущим')
      } else if (
        activeProject.statuses.some(
          (s) =>
            s.id !== status.id &&
            s.name.trim().toLowerCase() === lowercasedValue
        )
      ) {
        setTitleErrors('Название доски уже существует')
      } else {
        setTitleErrors('')
      }

      setNewTitle(value)
    }

    const onSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      try {
        if (e.key === ENTER && !titleErrors) {
          e.preventDefault()
          const newTitleTrimmed = newTitle.trim()

          await updateTaskStatusAsync.mutateAsync([
            activeProject,
            { id: status.id, name: newTitleTrimmed }
          ])

          setIsEditStatusTitle(false)
        }
      } catch (error) {
        console.error('Failed to update status:', error)
      }
    }

    const handleCancel = () => {
      setIsEditStatusTitle(false)
      setTitleErrors('')
    }

    const ActionIcon = isAddTask ? Close : Plus

    useEffect(() => {
      setNewTitle(status.name)
    }, [status.name])

    return (
      <div
        className={classNames(
          styles.header,
          isEditStatusTitle && '!border-accent',
          titleErrors && '!border-systemRed'
        )}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleCancel()
          }
        }}
      >
        <div className={styles.title}>
          {isHovered ? (
            <Drag
              className={classNames(
                'icon h-5 w-5 cursor-grab',
                isDragOverlay && 'cursor-grabbing'
              )}
              {...handleProps}
            />
          ) : (
            <div className={'w-5 h-5 flex items-center justify-center'}>
              <div
                className={styles.color}
                style={{
                  backgroundColor: `${status.color}`,
                  boxShadow: `0 0 6.9px 0 ${status.color}`
                }}
              />
            </div>
          )}
          {isEditStatusTitle ? (
            <Input
              autoFocus
              defaultValue={status.name}
              className={styles.inputContainer}
              containerClassName={'!outline-none'}
              placeholder={'Введите название доски'}
              maxLength={13}
              inputClassName={styles.input}
              onChange={handleInputChange}
              onKeyDown={async (e) => {
                await onSubmit(e)
              }}
            >
              <KbdElement
                kdb={ENTER}
                tooltipContent={'Изменить название'}
                className={'h-5'}
              />
            </Input>
          ) : (
            <h3 className='truncate max-w-[150px]'>
              {t(status.name) as string}
            </h3>
          )}
        </div>
        {!isEditStatusTitle && (
          <div className={'flex gap-1'} onClick={(e) => e.stopPropagation()}>
            {items.length > 0 && !isEditStatusTitle && (
              <div className={styles.taskCount}>
                <h4 className={'body-12'}>{items.length}</h4>
              </div>
            )}
            {status.code !== 'executed' && canCreateTasks && (
              <Button
                styleButton={'filled'}
                colorButton={!isAddTask ? 'accent' : 'dark'}
                className={'py-1 px-[10px] rounded'}
                icon={
                  <ActionIcon
                    className={classNames(
                      'w-4 h-4 ',
                      !isAddTask ? 'iconActive' : 'icon'
                    )}
                  />
                }
                onClick={() => setIsAddTask(!isAddTask)}
              />
            )}
            <AdditionalActionsPopover
              status={status}
              setIsEditStatusTitle={setIsEditStatusTitle}
              items={items}
              onRemoveContainer={onRemoveContainer}
              onDuplicateContainer={onDuplicateContainer}
              onMoveItems={onMoveItems}
            />
          </div>
        )}
      </div>
    )
  }
)
