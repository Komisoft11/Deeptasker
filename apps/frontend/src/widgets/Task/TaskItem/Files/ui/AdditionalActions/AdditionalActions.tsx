import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from '@/widgets/Task/TaskItem/Files/Files.module.scss'
import { useTasks } from '@/entities/Task'
import { ITaskComment } from '@/entities/TaskComment'
import { useComment } from '@/entities/TaskComment/lib/hooks/useComment'
import { FileData } from '@/entities/TaskComment/model/types/task-comment.interface'
import {
  CopyLink,
  Save,
  Trash,
  VerticalDots
} from '@/shared/assets/images/icons'
import {
  ENTITY,
  ERRORS,
  SUCCESS,
  TRANSLATION
} from '@/shared/const/translation'
import { copyTextToClipboard } from '@/shared/lib/helpers/copyTextToClipboard'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { DropdownMenu } from '@/shared/ui/DropdownMenu/DropdownMenu'


interface Props {
  comment?: ITaskComment
  file: FileData
  uploadedFileLink?: string
  open: boolean
  onOpenChange: (visible: boolean) => void
  setActiveFileId: (activeFileId: number) => void
  canDelete: boolean
}

export const AdditionalActions = ({
  comment,
  file,
  uploadedFileLink,
  open,
  onOpenChange,
  setActiveFileId,
  canDelete
}: Props) => {
  const {
    taskStore: { activeTask }
  } = useRootStore()
  const { t } = useTranslation([SUCCESS, ERRORS, TRANSLATION])
  const { deleteFileAsync: deleteCommentFileAsync } = useComment(activeTask)
  const { deleteFileAsync: deleteTaskFileAsync } = useTasks()

  const handleDeleteFile = async (
    comment: ITaskComment | undefined,
    file: FileData
  ) => {
    if (comment !== undefined) {
      await deleteCommentFileAsync.mutateAsync({
        comment: comment,
        fileId: file.id as number
      })
    } else {
      await deleteTaskFileAsync.mutateAsync({
        task: activeTask,
        fileId: file.id as number
      })
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger
        className={styles.extra}
        onClick={() => setActiveFileId(file.id as number)}
      >
        <VerticalDots className={'icon w-4 h-4'} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        side={'right'}
        sideOffset={16}
        alignOffset={-8}
        align={'start'}
        className={'flex flex-col gap-1 w-[240px]'}
      >
        <DropdownMenu.Item className={styles.item}>
          <a
            href={uploadedFileLink + '?download'}
            className={'flex items-center'}
          >
            <div className={'iconContainer hover:bg-transparent'}>
              <Save className={'icon h-4 w-4'} />
            </div>
            <p className={'body-14-16'}>
              {t('files.downloadFile', { ns: ENTITY })}
            </p>
          </a>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className={styles.item}
          onClick={async () => {
            if (uploadedFileLink) {
              await copyTextToClipboard(uploadedFileLink)
            }
          }}
        >
          <div className={'iconContainer hover:bg-transparent'}>
            <CopyLink className={'icon h-4 w-4'} />
          </div>
          <p className={'body-14-16'}>{t('copyLink', { ns: TRANSLATION })}</p>
        </DropdownMenu.Item>
        {canDelete && (
          <DropdownMenu.Item
            className={styles.item}
            onClick={async () => {
              await handleDeleteFile(comment, file)
            }}
          >
            <div className={'iconContainer hover:bg-transparent'}>
              <Trash className={'iconRed h-4 w-4'} />
            </div>
            <p className={'body-14-16 text-systemRed'}>
              {t('files.deleteFile', { ns: ENTITY })}
            </p>
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
