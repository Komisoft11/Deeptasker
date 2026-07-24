import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { FC, MouseEvent } from 'react'
import { useInputSearch } from '@/features/Search/lib/hooks/useInputSearch'
import { Folder } from '@/entities/Folder'
import { Task, useTasks } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'
import { Popover } from '@/shared/ui/Popover/Popover'
import styles from './FolderPopover.module.scss'


interface Props {
  disable?: boolean
  task: Task
  triggerClassName?: string
  contentClassName?: string
  selectedFolderId?: number
  onSelectFolder?: (folderId: number | null) => void
}

export const FolderPopover = observer(
  ({
    disable = false,
    task,
    triggerClassName,
    contentClassName,
    selectedFolderId
  }: Props) => {
    const { folderStore } = useRootStore()

    const folder = task.folderId && folderStore.get(Number(task.folderId))

    return (
      <Popover>
        <Popover.Trigger
          disabled={disable}
          className={classNames(styles.trigger, triggerClassName)}
        >
          <p className={'body-12 ellipsis max-w-[200px]'}>
            {task.folderId && folder ? folder.title : '-'}
          </p>
        </Popover.Trigger>
        <Popover.Content
          align={'end'}
          className={classNames(styles.content, contentClassName)}
        >
          <FolderDropdown
            task={task}
            selectedFolderId={selectedFolderId ?? undefined}
          />
        </Popover.Content>
      </Popover>
    )
  }
)

interface FolderDropdownProps {
  task: Task
  selectedFolderId?: number
}

const FolderDropdown: FC<FolderDropdownProps> = ({
  task,
  selectedFolderId
}) => {
  const {
    folderStore: { folders }
  } = useRootStore()
  // TODO: сделать useQuery для того, чтобы использовать в других местах без изменения проекта
  const { changeFolderAsync, removeFolderAsync } = useTasks()
  const changeFolder = async (e: MouseEvent, newFolder: Folder) => {
    e.preventDefault()
    e.stopPropagation()

    await changeFolderAsync.mutateAsync({
      taskId: task.id,
      folderId: newFolder.id
    })
  }

  const removeFolder = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    await removeFolderAsync.mutateAsync(task.id)
  }

  const { query, handleChangeInputSearch, filterItems } =
    useInputSearch<Folder>(folders, ['title'])

  const shouldShowInput = query || filterItems.length > 5
  return (
    <div className={'flex flex-col gap-2'}>
      {shouldShowInput && (
        <Input
          label={''}
          placeholder={'Найдите папку'}
          onChange={handleChangeInputSearch}
          value={query}
        />
      )}
      <div
        className={classNames(styles.dropdown, 'scrollbarContainerOnObjects')}
      >
        {task.folderId && (
          <div
            className={classNames(styles.item)}
            onClick={(e) => removeFolder(e)}
          >
            <p className={'body-14-16'}>{'Переместить в корень'}</p>
          </div>
        )}

        {filterItems.map((folder) => (
          <div
            className={classNames(
              styles.item,
              (task.folderId === folder.id || selectedFolderId === folder.id) &&
                styles.active
            )}
            key={folder.id}
            onClick={(e) => changeFolder(e, folder)}
          >
            <p className={'body-14-16 ellipsis w-[224px]'}>{folder.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
