import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { BreadcrumbsFolder } from '@/features/Folder'
import { TaskItem } from '@/features/Search/SearchResultList/TaskItem/TaskItem'
import { Folder } from '@/entities/Folder'
import { Task } from '@/entities/Task'
import { FolderIcon } from '@/shared/assets/images/icons'
import styles from './FolderItem.module.scss'


interface Props {
  folder: Folder
  tasks?: Task[]
}

export const FolderItem: FC<Props> = observer(({ folder, tasks = [] }) => {
  return (
    <div className={styles.body}>
      <div className={styles.item}>
        <FolderIcon className={classNames('icon', styles.icon)} />
        <BreadcrumbsFolder folder={folder} hasLastBreadcrumbLink />
      </div>
      {tasks.length > 0 &&
        tasks.map((task) => (
          <TaskItem
            key={folder.id + ':' + task.id}
            task={task}
            className={'px-0'}
          />
        ))}
    </div>
  )
})
