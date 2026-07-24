import { observer } from 'mobx-react-lite'
import { ProjectTags } from '@/widgets/Project'
import { ITag } from '@/entities/Project'
import { Task, usePermissionTask, useTasks } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

interface Props {
  task: Task
  disabled?: boolean
  triggerClassName?: string
  insideContainer?: boolean
}

export const TaskProjectTag = observer(
  ({ task, disabled, triggerClassName, insideContainer }: Props) => {
    const {
      projectStore: { activeProject }
    } = useRootStore()
    const { addTagAsync, deleteTagAsync } = useTasks()

    const handleDeleteTag = async (tag: ITag): Promise<void> => {
      await deleteTagAsync.mutateAsync({ task: task, tag: tag })
    }

    const handleAddTag = async (tag: ITag): Promise<void> => {
      await addTagAsync.mutateAsync({ task: task, tag: tag })
    }

    const { canEditTags } = usePermissionTask(task)

    return (
      <ProjectTags
        key={task.tags.length}
        tags={task.tags}
        activeProject={activeProject}
        handleDeleteTag={handleDeleteTag}
        handleAddTag={handleAddTag}
        disabled={!canEditTags || disabled}
        triggerClassName={triggerClassName}
        insideContainer={insideContainer}
      />
    )
  }
)
