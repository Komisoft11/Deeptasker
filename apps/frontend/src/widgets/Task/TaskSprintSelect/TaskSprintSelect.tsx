import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NewSprintDialog } from '@/pages/Project/ProjectSprintsPage/NewSprintDialog/NewSprintDialog'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { usePermissionProject } from '@/entities/Project'
import { Sprint } from '@/entities/Sprint/model/sprint'
import { SprintStatuses } from '@/entities/Sprint/model/types/sprint.types'
import { Close, Plus } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Select } from '@/shared/ui/Select/Select'


interface Props {
  disabled?: boolean
  onSprintSelect?: (sprintId: number | null) => void
  container?: HTMLElement
  sprintId?: number | null
  className?: string
  mode?: 'regular' | 'modal'
  taskId?: number
}

export const TaskSprintSelect = observer(
  ({
    disabled,
    onSprintSelect,
    container,
    sprintId,
    className,
    mode = 'regular',
    taskId
  }: Props) => {
    const { sprintStore } = useRootStore()

    const {
      permissions: { createSprints }
    } = usePermissionProject()

    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(
      sprintStore.find(sprintId)
    )

    const [isAddSprint, setIsAddSprint] = useState(false)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const { t } = useTranslation(ENTITY)

    if (sprintStore.loading) {
      return <div>Loading...</div>
    }

    const handleSelectChange = (value: string | null) => {
      const selected = sprintStore.sprints.find(
        (sprint) => sprint.title === value
      )
      selected && setSelectedSprint(selected)

      if (onSprintSelect && selected) {
        onSprintSelect(selected.id)
      }
    }

    const handleClearSelection = () => {
      setSelectedSprint(null)
      if (onSprintSelect) {
        onSprintSelect(null)
      }

      if (selectedSprint && taskId) {
        sprintStore.removeTasksFromSprint(selectedSprint.id, [taskId])
      }
    }

    const isModal = mode === 'modal'
    const isRegular = mode === 'regular'
    const isDisabled =
      disabled || (!createSprints && sprintStore.sprints.length === 0)

    const canInteractRegular = isRegular && !isDisabled
    const canInteractModal = isModal && !isDisabled
    const canSelectSprint = !isDisabled && selectedSprint
    return (
      <>
        <Select
          disabled={isDisabled}
          value={selectedSprint?.title || ''}
          onValueChange={handleSelectChange}
          open={isSelectOpen}
          onOpenChange={setIsSelectOpen}
        >
          <div
            className={classNames(
              'flex w-full',
              mode === 'modal' && 'justify-end'
            )}
          >
            <Select.Trigger
              className={classNames(
                'p-3 w-full h-10 body-12',
                isDisabled
                  ? 'bg-transparent border border-border cursor-not-allowed'
                  : 'border-none',
                selectedSprint ? '!rounded-r-none' : 'secondaryText',
                canInteractRegular && 'bg-hover',
                canInteractModal && 'bg-hover h-[38px]',
                className
              )}
              placeholder={t('sprints.selectSprint') as string}
            >
              {getSprintPeriod(selectedSprint)}
            </Select.Trigger>
            {canSelectSprint && (
              <div
                className={classNames(
                  'iconContainer !bg-hover !rounded-l-none flex items-center !h-[38px] body-12',
                  isRegular && '!h-10',
                  isModal && 'hover:opacity-70'
                )}
                onClick={handleClearSelection}
                aria-label='Clear selection'
              >
                <Close className={'w-4 h-4 icon'} />
              </div>
            )}
          </div>
          <Select.Portal container={container ?? document.body}>
            <Select.Content
              data-no-dnd={true}
              align={mode === 'modal' ? 'end' : 'start'}
              viewportProps={{
                className: 'flex flex-col gap-1'
              }}
              sideOffset={4}
              className={classNames(
                'w-[368px] max-h-[368px]',
                isModal && '!w-[300px]'
              )}
            >
              {sprintStore.sprints.map((sprint) => (
                <Select.Item
                  key={sprint.id}
                  value={sprint.title}
                  className={'flex justify-between'}
                  isComplex
                >
                  <div className={'flex flex-col gap-1 max-w-[50%]'}>
                    <p className={'body-12'}>{getSprintPeriod(sprint)}</p>
                    <p className={'body-12 secondaryText  ellipsis'}>
                      {sprint.title}
                    </p>
                  </div>
                  <p
                    className={classNames(
                      'py-1 px-1 rounded h-max body-12 text-activeText',
                      {
                        'bg-accent': sprint.status === SprintStatuses.Active,
                        'bg-textSecond':
                          sprint.status === SprintStatuses.Planned,
                        'bg-systemGreen':
                          sprint.status === SprintStatuses.Completed,
                        'bg-default': !sprint.status
                      }
                    )}
                  >
                    {t(`sprints.statuses.${sprint.status}`)}
                  </p>
                </Select.Item>
              ))}
              {createSprints && (
                <Button
                  styleButton={'filled'}
                  icon={<Plus />}
                  className={'body-14-16'}
                  onClick={() => {
                    setIsSelectOpen(false)
                    setTimeout(() => setIsAddSprint(true), 0)
                  }}
                >
                  {t('sprints.addSprint')}
                </Button>
              )}
            </Select.Content>
          </Select.Portal>
        </Select>
        <NewSprintDialog
          setIsAddSprint={setIsAddSprint}
          isAddSprint={isAddSprint}
        />
      </>
    )
  }
)
function getSprintPeriod(sprint: Sprint | null) {
  return (
    sprint &&
    `${formatDateTime({
      date: sprint.dateStart,
      includeTime: false
    })}
    - ${formatDateTime({ date: sprint.dateEnd, includeTime: false })}`
  )
}
