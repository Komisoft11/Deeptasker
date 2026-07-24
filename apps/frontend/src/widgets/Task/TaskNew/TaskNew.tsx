import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { nanoid } from 'nanoid'
import React, { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TaskCreationData } from '@/widgets/Task/TaskNew/types/task-creation.interface'
import { Description } from '@/widgets/Task/TaskNew/ui/Description'
import { Tags } from '@/widgets/Task/TaskNew/ui/Tags/Tags'
import { Users } from '@/widgets/Task/TaskNew/ui/Users/Users'
import { createTaskSchema, useTasks } from '@/entities/Task'
import { MAX_FILE_SIZE } from '@/shared/const/file'
import { ENTITY, ERRORS, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'
import styles from './TaskNew.module.scss'
import { Processes } from './ui/Processes/Processes'

interface Props {
  onOpenChange: (visible: boolean) => void
  sprintId?: number
}

export interface LocalFile {
  id: string
  originalName: string
  file: File
  size: number
  dateCreated: Date
}

export const TaskNew: FC<Props> = observer(({ onOpenChange, sprintId }) => {
  const {
    projectStore: { activeProject },
    sprintStore,
    folderStore,
    taskStore
  } = useRootStore()

  const { activeFolder } = folderStore

  const { createAsync, uploadFileAsync } = useTasks()

  const { t } = useTranslation([TRANSLATION, ENTITY, ERRORS])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<TaskCreationData>({
    resolver: yupResolver(createTaskSchema),
    mode: 'onSubmit'
  })

  const [selectedFiles, setSelectedFiles] = useState<LocalFile[]>([])

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles: LocalFile[] = []
    const rejectedFiles: File[] = []

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(file)
        return
      }

      validFiles.push({
        id: nanoid(),
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
      setSelectedFiles((prev) => [...prev, ...validFiles])
    }
  }

  const handleDeleteFile = (file: LocalFile) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== file.id))
  }

  const onCreate = async (data: TaskCreationData): Promise<void> => {
    await createAsync.mutateAsync(
      {
        title: data.title,
        projectId: activeProject.id,
        executorId: data.executor?.id,
        statusId: Number(data.status),
        folderId: activeFolder?.id,
        sprintId: sprintId ?? data.sprintId,
        content:
          data.description === '<p><br></p>' ? undefined : data.description,
        priority: Number(data.priority),
        deadlineDate: data.deadline,
        tags: data.tags?.map((tag) => tag.id),
        assignerId: data.assigner?.id,
        observers: data.observers?.map((observer) => observer.id)
      },
      {
        onSuccess: async ({ id, dateCreated, externalId }, variables) => {
          if (!id || !dateCreated) {
            return
          }

          const currentTask = await taskStore.create(
            id,
            dateCreated as string,
            externalId,
            variables
          )
          if (variables.folderId) {
            folderStore.addTaskToFolder(currentTask, variables.folderId)
          }

          if (data.observers && data.observers.length > 0) {
            data.observers.map((observer) =>
              taskStore.assignObserver([currentTask, observer])
            )
          }

          if (variables.sprintId) {
            sprintStore.addTasksToSprint(variables.sprintId, [id])
          }

          if (selectedFiles.length > 0) {
            const uploadPromises = selectedFiles.map((f) =>
              uploadFileAsync.mutateAsync({
                task: currentTask,
                file: f.file
              })
            )

            await Promise.all(uploadPromises)
          }
        },
        onError: () => {
          showToast({
            title: t('task.create', { ns: ERRORS }),
            type: 'error'
          })
        }
      }
    )
    onOpenChange(false)
  }

  const onCancel = () => {
    onOpenChange(false)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onCreate)} className={styles.form} id={''}>
      <div className={'flex h-full'}>
        <div className={styles.body}>
          <div className={'flex w-full gap-4 justify-between pt-4 pb-4'}>
            <p className={'body-14-16'}>{t('task.taskName', { ns: ENTITY })}</p>
            <div className={'flex flex-col gap-1 max-w-[61%] w-full'}>
              <Input
                {...register('title')}
                placeholder={
                  t('task.info.enterNameTask', { ns: ENTITY }) as string
                }
              />
              {errors?.title?.message && (
                <p className={'body-12 text-systemRed'}>
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>
          <Description
            control={control}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleDeleteFile={handleDeleteFile}
          />
          <div className={'flex pt-4 gap-2'}>
            <Button
              type={'submit'}
              className={styles.button}
              styleButton={'filled'}
              disabled={!isValid}
            >
              {t('task.info.createTask', { ns: ENTITY })}
            </Button>
            <Button
              className={styles.button}
              styleButton={'outline'}
              onClick={onCancel}
            >
              {t('cancel', { ns: TRANSLATION })}
            </Button>
          </div>
        </div>
        <div
          className={classNames(styles.sidebar, 'scrollbarContainerOnObjects')}
        >
          <Processes control={control} sprintId={sprintId} />
          <Users control={control} />
          <Tags control={control} />
        </div>
      </div>
    </form>
  )
})
