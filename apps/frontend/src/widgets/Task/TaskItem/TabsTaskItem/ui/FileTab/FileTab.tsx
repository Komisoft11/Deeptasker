import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Files } from '@/widgets/Task/TaskItem/Files/Files'
import { formatFileSize } from '@/widgets/Task/TaskItem/Files/helpers/formatFileSize'
import { getIconOrPreview } from '@/widgets/Task/TaskItem/Files/helpers/getIconOrPreview'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { FileService } from '@/entities/File/services/file.service'
import { useTasks } from '@/entities/Task'
import { FileData } from '@/entities/TaskComment/model/types/task-comment.interface'
import { CopyLink, Save, Trash } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { copyTextToClipboard } from '@/shared/lib/helpers/copyTextToClipboard'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Table } from '@/shared/ui/Table/Table'
import { createColumnHelper } from '@/shared/ui/Table/lib/createColumnHelper'
import styles from './FileTab.module.scss'


interface Props {
  filesView: 'cards' | 'list'
}

export const FileTab: FC<Props> = observer(({ filesView }) => {
  const {
    taskStore: { activeTask },
    sidebarStore
  } = useRootStore()
  const { deleteFileAsync } = useTasks()
  const columnHelper = createColumnHelper<FileData>()
  const { t } = useTranslation([ENTITY, TRANSLATION])
  const getLink = (file: FileData) =>
    FileService.fileUrl(activeTask, file.id as number)

  const handleDeleteFile = async (fileId: number) => {
    await deleteFileAsync.mutateAsync({ task: activeTask, fileId: fileId })
  }

  const columns = [
    columnHelper.accessor({
      id: 'preview',
      header: () => t('files.preview', { ns: ENTITY }),
      cell: (file) => (
        <div
          className={'flex hover:cursor-pointer'}
          onClick={() => {
            if (file) {
              window.open(getLink(file), '_blank')
            }
          }}
        >
          {getIconOrPreview(file.originalName, getLink(file))}
        </div>
      )
    }),
    columnHelper.accessor({
      id: 'title',
      header: () => t('name', { ns: TRANSLATION }),
      cell: (file) => (
        <p
          className={'py-3 w-full hover:cursor-pointer ellipsis max-w-[70%]'}
          onClick={() => {
            if (file) {
              window.open(getLink(file), '_blank')
            }
          }}
        >
          {file.originalName}
        </p>
      )
    }),
    columnHelper.accessor({
      id: 'size',
      header: () => t('size', { ns: TRANSLATION }),
      cell: (file) => <p>{file.size && formatFileSize(file.size)}</p>
    }),
    columnHelper.accessor({
      id: 'uploadingDate',
      header: () => t('dateAdded', { ns: TRANSLATION }),
      cell: (file) => (
        <p>
          {file.dateCreated
            ? formatDateTime({
                date: file.dateCreated,
                includeTime: !sidebarStore.isExtendedFirstLeftOpen
              })
            : ''}
        </p>
      )
    }),
    columnHelper.accessor({
      id: 'actions',
      header: () => '',
      cell: (file) => (
        <div className={'flex gap-1 justify-end w-full items-center'}>
          <a className={'iconContainer'} href={getLink(file) + '?download'}>
            <Save className={'icon w-4 h-4'} />
          </a>
          <div
            className={'iconContainer'}
            onClick={() => copyTextToClipboard(getLink(file))}
          >
            <CopyLink className={'icon w-4 h-4'} />
          </div>
          <div
            className={'iconContainer'}
            onClick={() => handleDeleteFile(file.id as number)}
          >
            <Trash className={'iconRed w-4 h-4'} />
          </div>
        </div>
      )
    })
  ]

  return (
    <div className={styles.container}>
      {!activeTask.files.length ? (
        <p className={'w-full text-center secondaryText body-12'}>
          {t('files.filesFromDescription', { ns: ENTITY })}
        </p>
      ) : filesView === 'list' ? (
        <Table className={'body-14-16'}>
          <Table.Head>
            <Table.Row className={classNames(styles.tableRow)}>
              {columns.map((c) => (
                <Table.Cell data-state={c.id} key={'header:' + c.id}>
                  {c.header()}
                </Table.Cell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body className={'flex flex-col'}>
            {activeTask.files?.map((file) => (
              <Table.Row className={classNames(styles.tableRow)} key={file.id}>
                {columns.map((c) => (
                  <Table.Cell key={'row:' + c.id} data-state={c.id}>
                    {c.cell(file)}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : filesView === 'cards' ? (
        <div className={'flex gap-4'}>
          <Files files={activeTask.files} isSmall />
        </div>
      ) : null}
    </div>
  )
})
