import classNames from 'classnames'
import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { MantineTextEditor } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { formatFileSize } from '@/widgets/Task/TaskItem/Files/helpers/formatFileSize'
import { getIconOrPreview } from '@/widgets/Task/TaskItem/Files/helpers/getIconOrPreview'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { LocalFile } from '@/widgets/Task/TaskNew/TaskNew'
import { TaskCreationData } from '@/widgets/Task/TaskNew/types/task-creation.interface'
import { Trash } from '@/shared/assets/images/icons'


interface Props {
  control: Control<TaskCreationData>
  selectedFiles: LocalFile[]
  handleDeleteFile: (file: LocalFile) => void
  handleFileSelect: (files: FileList | null) => void
}

export const Description = ({
  control,
  handleFileSelect,
  selectedFiles,
  handleDeleteFile
}: Props) => {
  return (
    <div className={'flex flex-col gap-2 flex-1'}>
      <Controller
        defaultValue={''}
        control={control}
        name={'description'}
        render={({ field: { onChange } }) => {
          return (
            <MantineTextEditor
              initialContent={''}
              className={
                'h-[400px] border-hoverOnHover scrollbarContainerOnObjects'
              }
              onFileChange={handleFileSelect}
              containerClassName={'overflow-hidden'}
              contentClassName={' max-h-[470px] h-full'}
              onContentChange={onChange}
              mode={'modal'}
            />
          )
        }}
      />
      <p className='secondaryText body-12'>Максимальный размер файла — 10 MB</p>
      {selectedFiles.length > 0 && (
        <ul className={'flex flex-wrap gap-2'}>
          {selectedFiles.map((file) => (
            <li
              key={file.id}
              className={
                'flex flex-col gap-1 rounded-lg border border-hover p-4 w-[250px] h-max justify-between flex-shrink-0'
              }
            >
              <div className={'flex w-full justify-between'}>
                <div className={'flex gap-1'}>
                  {getIconOrPreview(file.originalName)}

                  <div
                    className={classNames(
                      'flex gap-1 flex-col max-w-[calc(100%-64px)]  w-full'
                    )}
                  >
                    <p
                      className={
                        'body-12 w-full overflow-ellipsis break-all line-clamp-2'
                      }
                    >
                      {file.originalName}
                    </p>
                  </div>
                </div>
                <div
                  className={'iconContainer h-max'}
                  onClick={() => handleDeleteFile(file)}
                >
                  <Trash className={'iconRed w-4 h-4'} />
                </div>
              </div>
              {(file.size || file.dateCreated) && (
                <p className='secondaryText body-12 pl-9'>
                  {file.size && formatFileSize(file.size)}{' '}
                  {file.dateCreated && (
                    <span>
                      ·{' '}
                      {formatDateTime({
                        date: file.dateCreated,
                        includeTime: false
                      })}
                    </span>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
