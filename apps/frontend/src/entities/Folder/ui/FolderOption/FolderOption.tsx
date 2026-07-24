import classNames from 'classnames'
import { FC } from 'react'
import { Folder, IFolderDTO } from '@/entities/Folder'

interface Props {
  folder: IFolderDTO | Folder
  className?: string
}

export const FolderOption: FC<Props> = ({ folder, className }) => {
  return (
    <div
      className={classNames('flex gap-2 items-center hover:bg-red', className)}
    >
      <p className={'body-12'}>{folder.title}</p>
    </div>
  )
}
