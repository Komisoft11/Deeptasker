import classNames from 'classnames'
import React, { useRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { formatFileSize } from '@/widgets/Task/TaskItem/Files/helpers/formatFileSize'
import { getIconOrPreview } from '@/widgets/Task/TaskItem/Files/helpers/getIconOrPreview'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { FileData } from '@/entities/TaskComment/model/types/task-comment.interface'
import { Trash, Upload } from '@/shared/assets/images/icons'
import { MAX_FILE_SIZE } from '@/shared/const/file'
import { ERRORS, SUPPORT } from '@/shared/const/translation'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'


export const Files = () => {
  const { t } = useTranslation([SUPPORT, ERRORS])
  const { control } = useFormContext()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (
    files: FileList | null,
    field: { value: FileData[]; onChange: (files: FileData[]) => void }
  ) => {
    if (!files) return

    const validFiles: FileData[] = []
    const rejectedFiles: File[] = []

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(file)
        return
      }

      validFiles.push({
        originalName: file.name,
        file,
        size: file.size,
        dateCreated: new Date()
      })
    })

    if (rejectedFiles.length > 0) {
      showToast({
        title: t('fileMaxSize', { ns: ERRORS }),
        type: 'error'
      })
    }

    if (validFiles.length > 0) {
      field.onChange([...(field.value || []), ...validFiles])
    }
  }

  const handleFileDelete = (
    files: FileData[],
    file: FileData,
    onChange: (files: FileData[]) => void
  ) => {
    const updatedFiles = files.filter((f) => f !== file)
    onChange(updatedFiles)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <HorizontalLayout
      labelText={t(`bugReport.screenshot.label`, { ns: SUPPORT })}
      isSettingsPage
      className={'max-w-[41%] w-full'}
      containerClassName={'flex'}
    >
      <div className={'w-full'}>
        <Controller
          name='files'
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <div className={'flex flex-col gap-2'}>
              <div
                className={
                  'bg-hover body-12 max-w-[70%] w-full py-6 rounded-lg flex flex-col gap-2 justify-center items-center ' +
                  'hover:cursor-pointer hover:opacity-70'
                }
                onClick={handleClick}
              >
                <Upload className={'w-4 h-4 iconStroke'} />
                <div className={'flex flex-col justify-center items-center'}>
                  <p>
                    {t('bugReport.screenshot.fileUpload.clickToUpload', {
                      ns: SUPPORT
                    })}
                  </p>
                  <p className={'secondaryText'}>
                    {t('bugReport.screenshot.fileUpload.fileFormat', {
                      ns: SUPPORT
                    })}
                  </p>
                </div>
              </div>
              <input
                ref={inputRef}
                type='file'
                multiple
                accept={'image/*,.pdf'}
                className={'hidden'}
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(e.target.files, field)
                    e.target.value = ''
                  }
                }}
              />

              {field.value.length > 0 && (
                <ul className={'flex flex-wrap gap-2'}>
                  {field.value.map((file: FileData, idx: number) => (
                    <li
                      key={`${file.originalName} - ${idx}`}
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
                          onClick={() =>
                            handleFileDelete(field.value, file, field.onChange)
                          }
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
          )}
        />
      </div>
    </HorizontalLayout>
  )
}
