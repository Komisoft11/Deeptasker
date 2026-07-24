import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatFileSize } from '@/widgets/Task/TaskItem/Files/helpers/formatFileSize'
import { getIconOrPreview } from '@/widgets/Task/TaskItem/Files/helpers/getIconOrPreview'
import { AdditionalActions } from '@/widgets/Task/TaskItem/Files/ui/AdditionalActions/AdditionalActions'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { FileService } from '@/entities/File/services/file.service'
import { usePermissionTask } from '@/entities/Task'
import { ITaskComment } from '@/entities/TaskComment'
import { FileData } from '@/entities/TaskComment/model/types/task-comment.interface'
import { TaskCommentService } from '@/entities/TaskComment/services/task.comment.service'
import { Trash } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import styles from './Files.module.scss'

interface Props {
  files: FileData[]
  isSmall?: boolean
  includeTime?: boolean
  setSelectedFiles?: (
    files: FileData[] | ((prevFiles: FileData[]) => FileData[])
  ) => void
  comment?: ITaskComment
  withAdditionalActions?: boolean
}

export const Files: FC<Props> = observer(
  ({
    files,
    isSmall = false,
    includeTime = false,
    setSelectedFiles,
    comment,
    withAdditionalActions = true
  }) => {
    const { t } = useTranslation()
    const {
      authStore: { user },
      taskStore: { activeTask }
    } = useRootStore()

    const { canEditDescriptionTask } = usePermissionTask(activeTask)
    const [activeFileId, setActiveFileId] = useState<number | null>(null)

    const getLink = (file: FileData) =>
      comment
        ? TaskCommentService.getUrl(comment, file.id as number)
        : FileService.fileUrl(activeTask, file.id as number)

    const handleDeleteFile = (file: FileData) => {
      if (setSelectedFiles) {
        setSelectedFiles((prevFiles) =>
          prevFiles.filter((f) => f.originalName !== file.originalName)
        )
      }
    }

    const isUserComment = comment?.user.id === user.id

    const handleContextMenu = (event: React.MouseEvent, fileId: number) => {
      event.preventDefault()
      setActiveFileId(fileId)
    }

    const handleCloseMenu = () => {
      setActiveFileId(null)
    }

    const canDelete = isUserComment || canEditDescriptionTask

    return (
      <div className={classNames(styles.container)}>
        <ul className={styles.filesContainer}>
          {files.map((file) => (
            <li
              className={classNames(
                styles.file,
                isSmall && 'p-2 flex-row w-[240px] h-[70px] justify-normal',
                activeFileId === file.id && 'bg-objects'
              )}
              onContextMenu={(event) =>
                handleContextMenu(event, file.id as number)
              }
              key={file.id || file.originalName}
            >
              {getIconOrPreview(file.originalName, getLink(file))}
              {withAdditionalActions ? (
                <AdditionalActions
                  comment={comment}
                  file={file}
                  uploadedFileLink={getLink(file)}
                  open={activeFileId === file.id}
                  onOpenChange={handleCloseMenu}
                  setActiveFileId={setActiveFileId}
                  canDelete={canDelete}
                />
              ) : (
                <div
                  className={classNames('iconContainer h-max', styles.extra)}
                  onClick={() => handleDeleteFile(file)}
                >
                  <Trash className={'iconRed w-4 h-4'} />
                </div>
              )}

              <div
                className={classNames(
                  'flex gap-1 flex-col w-full',
                  isSmall && 'justify-between'
                )}
                onClick={() => {
                  if (getLink(file)) {
                    window.open(getLink(file), '_blank')
                  }
                }}
              >
                <p className={classNames('body-12', styles.fileName)}>
                  {file.originalName}
                </p>
                {(file.size || file.dateCreated) && (
                  <p className='secondaryText body-12'>
                    {file.size && formatFileSize(file.size)}{' '}
                    {file.dateCreated && (
                      <span>
                        ·{' '}
                        {formatDateTime({
                          date: file.dateCreated,
                          includeTime
                        })}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {!isSmall && files.length > 4 && (
          <Button
            colorButton={'dark'}
            styleButton={'filled'}
            className={classNames('self-end w-[200px] px-4 bg-objects')}
          >
            <p className={'body-14-16'}>{t('folder.showAll')}</p>
          </Button>
        )}
      </div>
    )
  }
)