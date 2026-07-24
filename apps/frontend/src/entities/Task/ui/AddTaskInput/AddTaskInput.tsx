import { UniqueIdentifier } from '@dnd-kit/core'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, {
  ChangeEvent,
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import { Task, useTasks } from '@/entities/Task'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import {
  CANCEL,
  CREATE,
  CREATE_AND_OPEN
} from '@/shared/lib/helpers/shortcut.helper'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'
import useOnClickOutside from '@/shared/lib/hooks/useOnClickOutside'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'

interface Props
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    'ref'
  > {
  showCancelButton?: boolean
  handleClickCancel?: () => void
  label?: string
  error?: boolean
  helperText?: string
  parent?: Task
  afterSubmit?: () => void
  containerClassName?: string
  onCreate?: (id: UniqueIdentifier) => void
  containerId?: number
}

export const AddTaskInput: FC<Props> = observer(
  ({
    parent,
    showCancelButton,
    handleClickCancel,
    afterSubmit,
    containerClassName,
    onCreate,
    containerId,
    ...props
  }) => {
    const { t } = useTranslation([TRANSLATION, ENTITY])
    const {
      workspaceStore: { activeWorkspace },
      taskStore,
      projectStore,
      folderStore
    } = useRootStore()
    const { createAsync } = useTasks()
    const navigate = useNavigate()
    const [titleTask, setTitleTask] = useState<string>('')
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [params] = useSearchParams()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setTitleTask(e.target.value)
    }
    const ref = useRef<HTMLInputElement | null>(null)

    const handleCancel = async () => {
      if (ref.current) {
        ref.current.value = ''
      }
      setTitleTask('')
      handleClickCancel?.()
    }

    const handleCreate = async (shouldOpenTask = false) => {
      if (ref.current) {
        ref.current.value = ''
      }

      if (!titleTask) {
        return
      }

      setTitleTask('')
      await createAsync.mutateAsync(
        {
          projectId: projectStore.activeProject.id,
          statusId: containerId,
          title: titleTask,
          parentId: parent?.id,
          folderId: folderStore.activeFolder?.id
        },
        {
          onSuccess: async (data, variables) => {
            const task = await taskStore.create(
              data.id,
              data.dateCreated as string,
              data.externalId,
              variables
            )

            if (variables.folderId) {
              folderStore.addTaskToFolder(task, variables.folderId)
            }

            if (shouldOpenTask && data.id) {
              const newTask = taskStore.get(data.id)

              const slug = projectStore.activeProject.slug
              if (!slug) {
                throw new Error('Active project not found')
              }

              const taskUrl = ProjectsNavigator.getOpenTaskUrl({
                currentWorkspaceId: activeWorkspace.id,
                projectSlug: slug,
                externalId: newTask.externalId,
                folderId: folderStore.activeFolder?.id,
                params
              })

              navigate(taskUrl)
            }

            onCreate?.(task.id)
          }
        }
      )

      const {
        activeProject: { slug }
      } = projectStore
      if (!slug) {
        throw new Error('not found active project')
      }

      if (parent) {
        runInAction(() => (parent.isCollapsed = true))
      }

      afterSubmit?.()
    }

    const handleFocus = () => {
      setIsFocused(true)
    }

    const handleBlur = () => {
      setIsFocused(false)
    }

    useKeyDown(ref, handleCreate, CREATE)
    useKeyDown(
      ref,
      async () => {
        await handleCreate(true)
      },
      [CREATE_AND_OPEN]
    )
    useKeyDown(ref, handleCancel, [CANCEL])

    useOnClickOutside(ref, async (event) => {
      const target = event.target as HTMLElement
      if (target.closest('[data-ignore-click]')) {
        return
      }

      if (titleTask) {
        await handleCreate()
      } else {
        handleClickCancel?.()
      }
    })

    return (
      <Input
        ref={ref}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={t('task.info.enterNameTask', { ns: ENTITY }) as string}
        value={titleTask}
        maxLength={90}
        data-ignore-click='true'
        data-ignore-subtask-click={'true'}
        containerClassName={containerClassName}
        {...props}
      >
        {isFocused && (
          <div className={'flex gap-2'} data-ignore-click>
            <KbdElement
              kdb={'Enter'}
              tooltipContent={t('task.info.addTask', { ns: ENTITY })}
            />
            <KbdElement
              kdb={'Ctrl+Enter'}
              tooltipContent={t('task.info.addTaskAndOpen', { ns: ENTITY })}
            />
          </div>
        )}
      </Input>
    )
  }
)
