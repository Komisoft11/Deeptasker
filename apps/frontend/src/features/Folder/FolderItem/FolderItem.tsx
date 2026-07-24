import { useDroppable } from '@dnd-kit/core'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { FolderMenu } from '@/widgets/Folder/FolderMenu/FolderMenu'
import { BreadcrumbsFolder, useFolderItem } from '@/features/Folder'
import { Folder, usePermissionFolder } from '@/entities/Folder'
import { FolderIcon, Gear } from '@/shared/assets/images/icons'
import useDialogAndPopover from '@/shared/lib/hooks/useDialogAndPopover'
import { Button } from '@/shared/ui/Button/Button'
import { Dialog } from '@/shared/ui/Dialog/Dialog'
import styles from './FolderItem.module.scss'


interface Props {
  folder: Folder
  className?: string
}

export const FolderItem: FC<Props> = observer(({ folder, className }) => {
  const { handleChangeFolder } = useFolderItem(folder)

  const dialogMenuProps = useDialogAndPopover()

  const { canDeleteFolder, canEditFolder } = usePermissionFolder(folder)

  const canManageFolder = canEditFolder || canDeleteFolder

  const handleOpenMenu = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    dialogMenuProps.onOpenChange(true)
  }

  const { setNodeRef, isOver } = useDroppable({
    id: folder.id,
    data: { type: 'folder', folder }
  })

  return (
    <>
      <li
        ref={setNodeRef}
        className={classNames(styles.folder, isOver && styles.over, className)}
        onClick={handleChangeFolder}
      >
        <div className={'flex gap-2 items-center max-w-[calc(100%-28px)]'}>
          <div className={'flex-1'}>
            <FolderIcon className={'w-5 h-5 icon'} />
          </div>

          <p className={'body-14-16 ellipsis'}>{folder.title}</p>
        </div>

        {canManageFolder && (
          <Button
            styleButton={'filled'}
            className={styles.settings}
            onClick={handleOpenMenu}
          >
            <Gear className={'w-5 h-5 icon'} />
          </Button>
        )}
      </li>
      <Dialog {...dialogMenuProps}>
        <Dialog.Content title={<BreadcrumbsFolder folder={folder} isSmall />}>
          <FolderMenu
            folder={folder}
            onOpenChange={dialogMenuProps.onOpenChange}
          />
        </Dialog.Content>
      </Dialog>
    </>
  )
})
