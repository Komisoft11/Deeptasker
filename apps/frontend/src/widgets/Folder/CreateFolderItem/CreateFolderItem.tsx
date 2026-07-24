import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useFolders } from '@/entities/Folder'
import { THIRD_CREATION_STEP } from '@/entities/Guidance'
import { FolderIcon, Plus } from '@/shared/assets/images/icons'
import { RouterParams } from '@/shared/config/route.config'
import { CANCEL, CREATE } from '@/shared/lib/helpers/shortcut.helper'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import styles from './CreateFolderItem.module.scss'

interface Props {
  disable?: boolean
}

export const CreateFolderItem: FC<Props> = observer(
  ({ disable = false }: Props) => {
    const { projectStore } = useRootStore()
    const { t } = useTranslation()
    const { createAsync } = useFolders()
    const { folderId } = useParams<RouterParams>()
    const ref = useRef<HTMLInputElement | null>(null)

    const [isFolderCreationHidden, setIsFolderCreationHidden] =
      useState<boolean>(true)
    const [newFolderName, setNewFolderName] = useState<string>('')

    const handleCreateFolder = async () => {
      if (!isFolderCreationHidden) {
        await createAsync.mutateAsync({
          title: newFolderName,
          parentId: folderId ? Number(folderId) : undefined,
          projectId: projectStore.activeProject.id
        })
        setIsFolderCreationHidden(true)
        setNewFolderName('')
      }
    }

    const handleCancelCreation = () => {
      setIsFolderCreationHidden(true)
      setNewFolderName('')
    }

    const handleBlur = async () => {
      if (newFolderName.length > 0) {
        await handleCreateFolder()
      } else {
        handleCancelCreation()
      }
    }

    useKeyDown(ref, handleCreateFolder, CREATE)
    useKeyDown(ref, handleCancelCreation, [CANCEL])

    return (
      <>
        <Button
          id={THIRD_CREATION_STEP}
          styleButton={'outline'}
          colorButton='dark'
          className={classNames(styles.button, folderId && 'ml-2')}
          onClick={() => setIsFolderCreationHidden(false)}
          disabled={!isFolderCreationHidden || disable}
          icon={<Plus className='icon w-5 h-5' />}
        >
          <p className='body-14-16'>{t('folder.createNewFolder')}</p>
        </Button>
        {!isFolderCreationHidden && (
          <div className={styles.create}>
            <div>
              <FolderIcon className='icon w-5 h-5 flex-1' />
            </div>
            <input
              className={classNames(styles.input, 'body-14-16')}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={handleBlur}
              maxLength={20}
              autoFocus
              ref={ref}
            />
          </div>
        )}
      </>
    )
  }
)
