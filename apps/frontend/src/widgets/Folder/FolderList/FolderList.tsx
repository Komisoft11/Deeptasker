import classNames from 'classnames'
import { isThisWeek, isToday, isYesterday } from 'date-fns'
import { observer } from 'mobx-react-lite'
import React, { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { FolderListLoader } from '@/widgets/Folder'
import { CreateFolderItem } from '@/widgets/Folder/CreateFolderItem/CreateFolderItem'
import { FolderBackItem } from '@/widgets/Folder/FolderBackItem/FolderBackItem'
import { FolderItem } from '@/features/Folder'
import { Folder, useFilterFolderFn } from '@/entities/Folder'
import { usePermissionProject } from '@/entities/Project'
import { RouterParams } from '@/shared/config/route.config'
import { ENTITY } from '@/shared/const/translation'
import {
  isLastWeek,
  isMoreThenLastWeek
} from '@/shared/lib/helpers/date.helper'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import useEnhancedEffect from '@/shared/lib/hooks/useEnhancedEffect'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import styles from './FolderList.module.scss'

interface Props {
  className?: string
}

export const FolderList: FC<Props> = observer(({ className }) => {
  const { folderStore } = useRootStore()
  const { t } = useTranslation([ENTITY])
  const ref = useRef<HTMLUListElement>(null)
  const { folderId } = useParams<RouterParams>()

  const {
    permissions: { createFolders }
  } = usePermissionProject()

  const [isListExpanded, setIsListExpanded] = useState<boolean>(false)
  const [hiddenFoldersLength, setHiddenFoldersLength] = useState<number>(0)

  const baseFiletAndSortFn = useFilterFolderFn()

  const folders: Folder[] = baseFiletAndSortFn(
    folderStore.activeFolder
      ? folderStore.activeFolder.subFolders
      : folderStore.rootFolders
  )

  const {
    foldersCreatedToday,
    foldersCreatedYesterday,
    foldersCreatedThisWeek,
    foldersCreatedLastWeek,
    foldersCreatedEarlier
  } = filterFolders(folders)

  const countHiddenFolders = () => {
    if (!ref.current) {
      return
    }

    const offsetTopOfList = ref.current.offsetTop

    const listItems = ref.current.querySelectorAll('li')
    const hiddenItems = Array.from(listItems).filter(
      (li) => li.offsetTop !== offsetTopOfList
    )

    setHiddenFoldersLength(hiddenItems.length)
  }

  useEnhancedEffect(() => {
    countHiddenFolders()
    window.addEventListener('resize', countHiddenFolders)
    return () => window.removeEventListener('resize', countHiddenFolders)
  }, [countHiddenFolders, folderStore.loading])

  if (folderStore.loading) {
    return <FolderListLoader />
  }

  return (
    <div className={classNames(styles.body, className)}>
      {isListExpanded ? (
        <div className={styles.expanded}>
          <div>
            <ul className={classNames(styles.list, 'pb-4 !max-h-full')}>
              {folderId && <FolderBackItem />}
              {createFolders && <CreateFolderItem />}
              {foldersCreatedToday.map((folder) => (
                <FolderItem key={`today-${folder.id}`} folder={folder} />
              ))}
            </ul>
          </div>
          <TimeFolders folders={foldersCreatedYesterday} time='yesterday' />
          <TimeFolders folders={foldersCreatedThisWeek} time='today' />
          <TimeFolders folders={foldersCreatedLastWeek} time='lastWeek.on' />
          <TimeFolders folders={foldersCreatedEarlier} time='early' />
        </div>
      ) : (
        <ul ref={ref} className={styles.list}>
          {folderId && <FolderBackItem />}
          {createFolders && <CreateFolderItem />}
          {folders.map((folder, index) => (
            <FolderItem key={`${index}-${folder.id}`} folder={folder} />
          ))}
        </ul>
      )}

      {hiddenFoldersLength > 0 && (
        <Button
          styleButton='filled'
          colorButton='dark'
          className={classNames(
            styles.all,
            'body-14-16',
            isListExpanded ? 'self-start' : 'self-end'
          )}
          onClick={() => setIsListExpanded((prev) => !prev)}
        >
          {isListExpanded
            ? t('collapse', nsObject())
            : `${t('folder.showAll')} (${hiddenFoldersLength})`}
        </Button>
      )}
    </div>
  )
})

interface TimeFoldersProps {
  folders: Folder[]
  time: 'yesterday' | 'today' | 'lastWeek.on' | 'early'
}

const TimeFolders: FC<TimeFoldersProps> = ({ folders, time }) => {
  const { t } = useTranslation()

  if (!folders.length) {
    return <></>
  }

  return (
    <div>
      <h3 className='py-4'>{t(time, nsObject())}</h3>
      <ul className={classNames(styles.list, 'pb-4 !max-h-full')}>
        {folders.map((folder) => (
          <FolderItem key={`${time}-${folder.id}`} folder={folder} />
        ))}
      </ul>
    </div>
  )
}

type FilteredFolders = {
  foldersCreatedToday: Folder[]
  foldersCreatedYesterday: Folder[]
  foldersCreatedThisWeek: Folder[]
  foldersCreatedLastWeek: Folder[]
  foldersCreatedEarlier: Folder[]
}

function filterFolders(folders: Folder[]): FilteredFolders {
  const foldersCreatedToday: Folder[] = []
  const foldersCreatedYesterday: Folder[] = []
  const foldersCreatedThisWeek: Folder[] = []
  const foldersCreatedLastWeek: Folder[] = []
  const foldersCreatedEarlier: Folder[] = []

  folders.forEach((folder) => {
    if (isToday(folder.dateCreated)) {
      foldersCreatedToday.push(folder)
    }

    if (isYesterday(folder.dateCreated)) {
      foldersCreatedYesterday.push(folder)
    }

    if (
      isThisWeek(folder.dateCreated) &&
      !isToday(folder.dateCreated) &&
      !isYesterday(folder.dateCreated)
    ) {
      foldersCreatedThisWeek.push(folder)
    }

    if (isLastWeek(folder.dateCreated)) {
      foldersCreatedLastWeek.push(folder)
    }

    if (isMoreThenLastWeek(folder.dateCreated)) {
      foldersCreatedEarlier.push(folder)
    }
  })

  return {
    foldersCreatedToday,
    foldersCreatedYesterday,
    foldersCreatedThisWeek,
    foldersCreatedLastWeek,
    foldersCreatedEarlier
  }
}
