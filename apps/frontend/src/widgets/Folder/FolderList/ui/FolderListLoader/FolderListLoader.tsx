import classNames from 'classnames'
import React, { FC } from 'react'
import { CreateFolderItem } from '@/widgets/Folder/CreateFolderItem/CreateFolderItem'
import styles from '@/widgets/Folder/FolderList/FolderList.module.scss'
import { EmptyItem } from '@/shared/ui/Loading/EmptyItem'


export const FolderListLoader: FC = () => {
  const emptyFolders = new Array<null>(6).fill(null)

  return (
    <div className={classNames(styles.body, 'mb-4')}>
      <ul className={styles.list}>
        <CreateFolderItem disable={true} />
        {emptyFolders.map((_, index) => (
          <EmptyItem key={index} className={'w-[170px] h-[42px] rounded-lg'} />
        ))}
      </ul>
    </div>
  )
}
