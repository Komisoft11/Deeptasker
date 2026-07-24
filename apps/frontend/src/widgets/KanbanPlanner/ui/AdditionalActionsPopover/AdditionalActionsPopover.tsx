import { observer } from 'mobx-react-lite'
import React, {
  Dispatch,
  FC,
  SVGProps,
  SetStateAction,
  useMemo,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  KanbanContainer,
  KanbanItem
} from '@/widgets/KanbanPlanner/types/KanbanItem.interface'
import {
  ActionItem,
  ChangeColor,
  MoveTasksDialog
} from '@/widgets/KanbanPlanner/ui/AdditionalActionsPopover/ui'
import { ITaskStatus, useProjects } from '@/entities/Project'
import { Task } from '@/entities/Task'
import {
  Copy,
  Edit,
  Move,
  Trash,
  VerticalDots
} from '@/shared/assets/images/icons'
import { ENTITY, ERRORS, SUCCESS } from '@/shared/const/translation'
import useDialogAndPopover from '@/shared/lib/hooks/useDialogAndPopover'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Dialog } from '@/shared/ui/Dialog/Dialog'
import { Popover } from '@/shared/ui/Popover/Popover'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'


interface Props {
  status: ITaskStatus
  onRemoveContainer?: () => void
  onDuplicateContainer?(tasks: Task[], status: ITaskStatus): void
  onMoveItems?(
    fromContainer: KanbanContainer,
    toContainer: KanbanContainer
  ): void
  setIsEditStatusTitle: Dispatch<SetStateAction<boolean>>
  items: KanbanItem[]
}

interface Action {
  text: string
  Icon: FC<SVGProps<SVGSVGElement>>
  onClick: () => void
}

export const AdditionalActionsPopover = observer(
  ({
    status,
    onRemoveContainer,
    onDuplicateContainer,
    onMoveItems,
    setIsEditStatusTitle,
    items
  }: Props) => {
    const { taskStore } = useRootStore()

    const [statusColor, setStatusColor] = useState('')
    const { deleteTaskStatusAsync, duplicateStatusAsync } = useProjects()
    const {
      projectStore: { activeProject }
    } = useRootStore()
    const dialogMenuProps = useDialogAndPopover()
    const { t } = useTranslation([ENTITY, ERRORS, SUCCESS])

    const handleDuplicate = async () => {
      const toastId = showToast({
        title: t('kanban.board.duplicateLoading', { ns: ENTITY }),
        type: 'info',
        noAutoclose: true
      })

      try {
        await duplicateStatusAsync.mutateAsync(
          { project: activeProject, status },
          {
            onSuccess: (dto, { status }) => {
              toast.dismiss(toastId)

              const { duplicatedStatus, duplicatedTasks } = taskStore.duplicate(
                dto,
                status
              )

              onDuplicateContainer?.(duplicatedTasks, duplicatedStatus)

              showToast({
                title: t('kanban.duplicateSuccess.title', { ns: SUCCESS }),
                type: 'success',
                text: t('kanban.duplicateSuccess.description', {
                  name: status.name,
                  ns: SUCCESS
                }) as string
              })
            },
            onError: () => {
              toast.dismiss(toastId)

              showToast({
                title: t('kanban.duplicateError.title', { ns: ERRORS }),
                type: 'error'
              })
            }
          }
        )
      } catch (e) {
        toast.dismiss(toastId)

        showToast({
          title: t('kanban.duplicateError.title', { ns: ERRORS }),
          type: 'error'
        })
      }
    }

    const handleMoveTasks = () => {
      dialogMenuProps.onOpenChange(true)
    }

    const isExecuted = status.code === 'executed'
    const isCustomStatus = !status.code

    const canMoveTasks = !isExecuted && items.length > 0
    const canDuplicate = !isExecuted
    const canChangeColor = isCustomStatus
    const canChangeTitle = isCustomStatus
    const canDeleteStatus = isCustomStatus

    const handleDeleteStatus = async (status: ITaskStatus) => {
      const toastId = showToast({
        title: t('kanban.board.deleteLoading', { ns: ENTITY }),
        type: 'info',
        noAutoclose: true
      })

      const dto = { project: activeProject, status: status }
      try {
        await deleteTaskStatusAsync.mutateAsync({ ...dto, toastId })
      } catch (e) {
        toast.dismiss(toastId)
        showToast({
          title: t('kanban.deleteError.title', { ns: ERRORS }),
          text: t('kanban.deleteError.description', {
            ns: ERRORS,
            name: status.name
          }) as string,
          type: 'error'
        })
      }
    }

    const actions = useMemo<Action[]>(() => {
      const result: Action[] = []

      if (canDuplicate) {
        result.push({
          text: t('kanban.board.duplicate', { ns: ENTITY }),
          Icon: Copy,
          onClick: handleDuplicate
        })
      }

      if (canMoveTasks) {
        result.push({
          text: t('kanban.board.moveAllTasksFromStatus', { ns: ENTITY }),
          Icon: Move,
          onClick: handleMoveTasks
        })
      }

      return result
    }, [canDuplicate, canMoveTasks, handleDuplicate, status, items])

    const hasAnyUserAction =
      actions.length > 0 || canChangeColor || canDeleteStatus || canChangeTitle

    return (
      <>
        {hasAnyUserAction && (
          <Popover>
            <Popover.Trigger
              className='py-1 px-[10px] bg-hover rounded hover:hoverOnHover'
              onClick={() => setStatusColor(status.color)}
            >
              <VerticalDots className='w-4 h-4 icon' />
            </Popover.Trigger>
            <Popover.Content
              side='right'
              align='start'
              className='flex flex-col gap-2 w-[300px] '
            >
              {canChangeTitle && (
                <ActionItem
                  text={t('kanban.board.rename', { ns: ENTITY })}
                  Icon={Edit}
                  onClick={() => setIsEditStatusTitle(true)}
                />
              )}
              {actions.length > 0 && (
                <div className='flex flex-col gap-1'>
                  {actions.map((action, index) => (
                    <ActionItem
                      key={index}
                      text={action.text}
                      Icon={action.Icon}
                      onClick={action.onClick}
                    />
                  ))}
                </div>
              )}
              {canChangeColor && (
                <ChangeColor
                  hasBaseActions={actions.length > 0}
                  statusColor={statusColor}
                  setStatusColor={setStatusColor}
                  status={status}
                />
              )}
              {canDeleteStatus && (
                <ActionItem
                  text={t('kanban.board.delete', { ns: ENTITY })}
                  Icon={Trash}
                  canDelete
                  onClick={async () => {
                    await handleDeleteStatus(status)
                    onRemoveContainer?.()
                  }}
                />
              )}
            </Popover.Content>
          </Popover>
        )}
        <Dialog {...dialogMenuProps}>
          <Dialog.Content
            title={t('kanban.board.moveTasks', { ns: ENTITY })}
            className={'h-max max-w-[700px]'}
          >
            <MoveTasksDialog
              clickedStatus={status}
              items={items}
              onSubmitClick={() => dialogMenuProps.onOpenChange(false)}
              onMoveItems={onMoveItems}
            />
          </Dialog.Content>
        </Dialog>
      </>
    )
  }
)
