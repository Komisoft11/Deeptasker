import { observer } from 'mobx-react-lite'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAllChildrenIds } from '@/features/Task/columns/TaskNameColumn/ui/MovePopover/utils/getAllChildrenIds'
import { Task, useTasks } from '@/entities/Task'
import { useTaskFolderContext } from '@/entities/Task/context/TaskFolderContext'
import { ArrowLeft, File, FolderIcon, Move } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Popover } from '@/shared/ui/Popover/Popover'


interface Props {
  task: Task
}

type MoveOption = 'folder' | 'task' | null

export const MovePopover: FC<Props> = observer(({ task }) => {
  const [selectedOption, setSelectedOption] = useState<MoveOption>(null)
  const [opened, setOpened] = useState<boolean>(false)
  const { changeFolderAsync, removeFolderAsync, moveTaskAsync } = useTasks()
  const {
    folderStore: { folders }
  } = useRootStore()
  const { t } = useTranslation([ENTITY])

  const { flattenedItems } = useTaskFolderContext()

  const childrenIds = getAllChildrenIds(task.id, flattenedItems)

  const filteredTasks = flattenedItems.filter(
    (t) =>
      t.id !== task.id && !childrenIds.includes(t.id) && t.id !== task.parentId
  )

  const availableFolders = folders.filter((f) => f.id !== task.folderId)

  const canMoveToFolder = folders.length > 0 || !!task.folderId
  const canMoveToTask = filteredTasks.length > 0 || !!task.parentId

  const renderFolderList = () => (
    <div className='flex flex-col gap-1 max-h-[240px] scrollbarContainerOnObjects overflow-y-auto overflow-x-hidden'>
      {task.folderId && (
        <div
          className='flex justify-between items-center w-full p-2 rounded-lg hover:bg-hover cursor-pointer gap-2'
          onClick={() => removeFolderAsync.mutateAsync(task.id)}
        >
          <p className='body-14-16 break-all'>
            {t('task.move.backToRootFolder', { ns: ENTITY })}
          </p>
        </div>
      )}
      {availableFolders.map((folder) => (
        <div
          key={folder.id}
          className='flex justify-between items-center w-full p-2 rounded-lg hover:bg-hover cursor-pointer gap-2'
          onClick={() =>
            changeFolderAsync.mutateAsync({
              taskId: task.id,
              folderId: folder.id
            })
          }
        >
          <p className='body-14-16 break-all'>{folder.title}</p>
          <div className='p-1 rounded bg-hover body-12 h-max'>
            <p>
              {folder.parentId
                ? t('task.move.subfolder', { ns: ENTITY })
                : t('task.move.folder', { ns: ENTITY })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )

  const renderTaskList = () => (
    <div className='flex flex-col gap-1 max-h-[240px] scrollbarContainerOnObjects overflow-y-auto'>
      {task.parentId && (
        <div
          className='flex justify-between items-center w-full p-2 rounded-lg hover:bg-hover cursor-pointer gap-2'
          onClick={() =>
            moveTaskAsync.mutateAsync({
              taskId: task.id,
              taskFromId: task.parentId,
              order: 1
            })
          }
        >
          <p className='body-14-16 break-all'>
            {t('task.move.backToRootTasks', { ns: ENTITY })}
          </p>
        </div>
      )}
      {filteredTasks.map((taskTo) => (
        <div
          key={taskTo.id}
          className='flex justify-between w-full gap-2 items-center p-2 rounded-lg hover:bg-hover cursor-pointer'
          onClick={() =>
            moveTaskAsync.mutateAsync({
              taskId: task.id,
              taskFromId: taskTo?.parentId,
              taskToId: taskTo.id,
              order: 1
            })
          }
        >
          <p className='body-14-16 break-all'>{taskTo.title}</p>
          <div className='p-1 rounded bg-hover body-12 h-max'>
            <p>
              {taskTo.parentId
                ? t('task.move.subtask', { ns: ENTITY })
                : t('task.move.task', { ns: ENTITY })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )

  const renderContent = () => {
    if (selectedOption === 'folder') return renderFolderList()
    if (selectedOption === 'task') return renderTaskList()

    return (
      <>
        {canMoveToFolder && (
          <div
            className='flex gap-2 items-center p-2 rounded-lg hover:bg-hover cursor-pointer'
            onClick={() => setSelectedOption('folder')}
          >
            <FolderIcon className='w-4 h-4 icon' />
            <p className='body-14-16'>
              {t('task.move.toFolder', { ns: ENTITY })}
            </p>
          </div>
        )}
        {canMoveToTask && (
          <div
            className='flex gap-2 items-center p-2 rounded-lg hover:bg-hover cursor-pointer'
            onClick={() => setSelectedOption('task')}
          >
            <File className='w-4 h-4 icon' />
            <p className='body-14-16'>
              {t('task.move.toTask', { ns: ENTITY })}
            </p>
          </div>
        )}
      </>
    )
  }

  const isMoveOptionSelected =
    selectedOption === 'folder' || selectedOption === 'task'

  return (
    <Popover
      open={opened}
      onOpenChange={(open) => {
        setOpened(open)
        if (!open) {
          setSelectedOption(null)
        }
      }}
    >
      <Popover.Trigger
        className={
          'moveTaskPopover p-2 rounded-lg bg-hover opacity-0 transition-all duration-400 ease-linear'
        }
        onClick={(e) => e.stopPropagation()}
      >
        <Move className={'w-4 h-4 icon'} />
      </Popover.Trigger>
      <Popover.Content
        align={'start'}
        className={'flex flex-col gap-2 w-[270px]'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={'flex gap-1 items-center p-1 border-b border-hover'}>
          {isMoveOptionSelected && (
            <div
              className={'iconContainer'}
              onClick={() => setSelectedOption(null)}
            >
              <ArrowLeft className={'w-4 h-4 icon'} />
            </div>
          )}

          <p className={'body-14-20'}>{t('task.moveTask', { ns: ENTITY })}</p>
        </div>

        {renderContent()}
      </Popover.Content>
    </Popover>
  )
})
