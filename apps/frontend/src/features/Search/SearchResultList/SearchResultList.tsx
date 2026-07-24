import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderItem } from '@/features/Search'
import { TaskItem } from '@/features/Search/SearchResultList/TaskItem/TaskItem'
import { useFilterFolderFn } from '@/entities/Folder'
import { Task, useFilterAndSortTaskFn } from '@/entities/Task'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './SearchResultList.module.scss'

export const SearchResultList: FC = observer(() => {
  const { folderStore, taskStore } = useRootStore()
  const { t } = useTranslation(TRANSLATION)

  const filterFolders = useFilterFolderFn()
  const { filterAndSortTasks } = useFilterAndSortTaskFn()

  const foundFolders = useMemo(
    () => filterFolders(folderStore.folders),
    [filterFolders, folderStore.folders]
  )

  const tasks = useMemo(
    () => filterAndSortTasks(taskStore.tasks),
    [filterAndSortTasks, taskStore.tasks]
  )

  const tasksWithoutFolders = tasks.filter((task) => !task.folderId)
  const tasksWithFolders = tasks.filter(
    (task): task is Task & { folderId: number } => task.folderId != null
  )

  const foldersWithTasks = useMemo(() => {
    const folderMap = new Map<number, Task[]>()

    tasksWithFolders.forEach((task) => {
      const folderId = task.folderId
      if (!folderMap.has(folderId)) {
        folderMap.set(folderId, [])
      }
      folderMap.get(folderId)!.push(task)
    })

    return Array.from(folderMap.entries()).map(([folderId, tasks]) => {
      const folder = folderStore.get(folderId)
      return {
        folder,
        tasks
      }
    })
  }, [tasksWithFolders, folderStore])

  if (
    !foundFolders.length &&
    !foldersWithTasks.length &&
    !tasksWithoutFolders.length
  ) {
    return (
      <div className={styles.body}>
        <p className='body-16 secondaryText'>{t('sorryNothingFound')}</p>
      </div>
    )
  }

  const hasTasks = foldersWithTasks.length > 0 || tasksWithoutFolders.length > 0
  const hasFolders = foundFolders.length > 0

  return (
    <div className={styles.body}>
      <ul className={classNames(styles.list, 'scrollbarContainerOnBg')}>
        {hasFolders && (
          <>
            <p className='body-16 secondaryText'>Найденные папки</p>
            {foundFolders.map((folder) => (
              <li key={`folder-${folder.id}`} className='flex flex-col gap-2'>
                <FolderItem folder={folder} />
              </li>
            ))}
          </>
        )}

        {hasTasks && (
          <>
            <p className='body-16 secondaryText'>Найденные задачи</p>
            {foldersWithTasks.map(({ folder, tasks }) => (
              <li
                key={`folder-with-tasks-${folder.id}`}
                className='flex flex-col gap-2'
              >
                <FolderItem folder={folder} tasks={tasks} />
              </li>
            ))}
            {tasksWithoutFolders.map((task) => (
              <li
                key={`task-${task.id}`}
                className='flex flex-col gap-2 border-b border-b-objects py-1'
              >
                <TaskItem task={task} />
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  )
})
