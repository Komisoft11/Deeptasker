import { observer } from 'mobx-react-lite'
import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  SetStateAction,
  useState
} from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { MAX_TITLE_LENGTH } from '@/widgets/Task/TaskItem/BodyTaskItem/const/taskConsts'
import { Task, usePermissionTask, useTasks } from '@/entities/Task'
import { RouterParams } from '@/shared/config/route.config'
import {
  ENTER,
  ENTER_SHORT,
  ESCAPE,
  ESCAPE_SHORT
} from '@/shared/const/keyboardKeys'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'


interface Props extends ComponentPropsWithoutRef<'a'> {
  task: Task
  isEditTitle: boolean
  setIsEditTitle: Dispatch<SetStateAction<boolean>>
}

export const TitleTask = observer(
  ({
    task,
    children,
    className,
    isEditTitle,
    setIsEditTitle,
    ...props
  }: Props) => {
    const {
      workspaceStore: { activeWorkspace }
    } = useRootStore()
    const [params] = useSearchParams()
    const [title, setTitle] = useState(task.title)
    const { updateAsync } = useTasks()
    const { canEditTitleTask } = usePermissionTask(task)

    const { folderId } = useParams<RouterParams>()
    const { view } = useCurrentView()

    const handleSave = async () => {
      if (!title.trim()) return

      task.title = title

      await updateAsync.mutateAsync({ dto: { title: task.title }, id: task.id })

      setIsEditTitle(false)
    }

    const handleCancel = () => {
      setTitle(task.title)
      setIsEditTitle(false)
    }

    if (isEditTitle && canEditTitleTask) {
      return (
        <div className={'flex w-full'}>
          <Input
            containerClassName={'py-1 pl-3 pr-1 h-8'}
            value={title}
            autoFocus={true}
            onBlur={handleCancel}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === ENTER) {
                await handleSave()
              } else if (e.key === ESCAPE) {
                handleCancel()
              }
            }}
          >
            <div className={'flex gap-1'}>
              <KbdElement kdb={ENTER_SHORT} tooltipContent={'Сохранить'} />
              <KbdElement kdb={ESCAPE_SHORT} tooltipContent={'Отменить'} />
            </div>
          </Input>
        </div>
      )
    }

    return (
      <Link
        to={ProjectsNavigator.getOpenTaskUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: task.project.slug,
          externalId: task.externalId,
          folderId,
          view,
          params
        })}
        className={className}
        {...props}
      >
        {children}
      </Link>
    )
  }
)
