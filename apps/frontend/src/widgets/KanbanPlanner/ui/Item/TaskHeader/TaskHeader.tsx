import type { UniqueIdentifier } from '@dnd-kit/core'
import classNames from 'classnames'
import React, { FC, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { ExternalId, Task, usePermissionTask, useTasks } from '@/entities/Task'
import { CardSize } from '@/entities/TaskPlanner'
import {
  CopyLink,
  PlusCircle,
  Trash,
  VerticalDots
} from '@/shared/assets/images/icons'
import { viewTabs } from '@/shared/config/route.config'
import { ENTITY } from '@/shared/const/translation'
import { copyTextToClipboard } from '@/shared/lib/helpers/copyTextToClipboard'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Popover } from '@/shared/ui/Popover/Popover'


interface Props {
  task: Task
  setAddSubtask: (isAddSubtask: boolean) => void
  removeItem?: (id: UniqueIdentifier) => void
  setAccordionValue: (value: 'subtasks' | undefined) => void
}

interface Action {
  text: string
  Icon: FC<SVGProps<SVGSVGElement>>
  isVisible?: boolean
  onClick?: () => void | Promise<void>
}

export const TaskHeader = ({
  task,
  setAddSubtask,
  removeItem,
  setAccordionValue
}: Props) => {
  const {
    workspaceStore: { activeWorkspace },
    taskPlanerStore: { cardSize },
    projectStore: {
      activeProject: { slug }
    }
  } = useRootStore()

  const { t } = useTranslation([ENTITY])

  const navigate = useNavigate()

  const isCardLarge = cardSize === CardSize.large

  const { deleteAsync } = useTasks()
  const { folderId } = useParams()
  const [params] = useSearchParams()
  const { canDeleteTask, canCreateSubTasks, canOpenTask } =
    usePermissionTask(task)

  const actions: Action[] = [
    {
      text: t('task.subtasks.create', { ns: ENTITY }),
      Icon: PlusCircle,
      isVisible: canCreateSubTasks,
      onClick: () => {
        setAccordionValue('subtasks')
        setAddSubtask(true)
      }
    },
    {
      text: t('task.copyLink', { ns: ENTITY }),
      Icon: CopyLink,
      onClick: () =>
        copyTextToClipboard(
          `${
            import.meta.env.VITE_APP_API_HOST
          }${ProjectsNavigator.getOpenTaskUrl({
            currentWorkspaceId: activeWorkspace.id,
            projectSlug: slug,
            externalId: task.externalId,
            view: viewTabs.KANBAN
          })}`
        )
    }
  ]

  const handleDelete = async () => {
    removeItem?.(task.id)
    return await deleteAsync.mutateAsync(task)
  }

  const isShowId = LocalStorageHelper.getIsShowId()

  const handleOpenTask = () => {
    navigate(
      ProjectsNavigator.getOpenTaskUrl({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: task.project.slug,
        externalId: task.externalId,
        view: viewTabs.KANBAN,
        folderId,
        params
      })
    )
  }

  return (
    <div className={'flex flex-col gap-1'}>
      <div className='flex justify-between w-full gap-2 items-center'>
        <h4
          className={classNames(
            'line-clamp-2',
            canOpenTask && 'hover:cursor-pointer'
          )}
          style={{ userSelect: 'all' }}
          onClick={(e) => {
            e.stopPropagation()
            if (canOpenTask) handleOpenTask()
          }}
        >
          {task.title}
        </h4>
        <div className={'flex gap-1'}>
          {isShowId && <ExternalId externalId={task.externalId} />}
          <Popover>
            <Popover.Trigger
              className={'iconContainer h-max !rounded'}
              data-ignore-click='true'
            >
              <VerticalDots className='icon w-4 h-4' />
            </Popover.Trigger>
            <Popover.Content
              align={'start'}
              side={'right'}
              data-ignore-click='true'
              className={'w-[300px] p-0'}
            >
              <div
                className={classNames(
                  'flex flex-col gap-1 p-2',
                  canDeleteTask && 'border-b border-hover'
                )}
              >
                {actions
                  .filter((action) => action.isVisible !== false)
                  .map((action, index) => (
                    <ActionItem
                      key={index}
                      text={action.text}
                      Icon={action.Icon}
                      onClick={action.onClick}
                    />
                  ))}
              </div>
              {canDeleteTask && (
                <div className={'p-2'} onClick={handleDelete}>
                  <ActionItem text={t('task.delete')} Icon={Trash} isDelete />
                </div>
              )}
            </Popover.Content>
          </Popover>
        </div>
      </div>
      {task.content && isCardLarge && (
        <div
          className={'max-w-[260px] break-words line-clamp-3 body-14-16'}
          dangerouslySetInnerHTML={{ __html: task.content }}
        />
      )}
    </div>
  )
}

interface ActionProps {
  text: string
  Icon: FC<SVGProps<SVGSVGElement>>
  isDelete?: boolean
  onClick?: () => void
}

const ActionItem = ({ text, Icon, isDelete = false, onClick }: ActionProps) => (
  <div
    className='flex items-center hover:bg-hover py-1 pr-2 rounded-lg'
    onClick={onClick}
  >
    <div className='p-2'>
      <Icon className={classNames('icon w-5 h-5', isDelete && 'iconRed')} />
    </div>
    <p
      className={classNames(
        isDelete ? 'text-systemRed' : undefined,
        'body-14-16'
      )}
    >
      {text}
    </p>
  </div>
)
