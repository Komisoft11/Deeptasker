import { observer } from 'mobx-react-lite'
import { TaskSection } from '@/widgets/Task/TaskItem/SidebarTaskItem/ui/TaskSection/TaskSection'
import { usePermissionTask } from '@/entities/Task/model/PermissionTask'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ActionButtonsDrawer } from './ui/ActionButtons/ActionButtonsDrawer'


export const SidebarTaskItem = observer(() => {
  const {
    taskStore: { activeTask },
    workspaceStore
  } = useRootStore()

  const { activeWorkspace } = workspaceStore

  const permissions = usePermissionTask(activeTask)

  const isActionButtonsShow =
    permissions.canTrackTask || permissions.canExecuteTask

  return (
    <div className={'w-[400px] border-l border-border'}>
      {isActionButtonsShow && <ActionButtonsDrawer />}
      <TaskSection
        isActionButtonsShow={isActionButtonsShow}
        workspaceTitle={activeWorkspace.title}
      />
    </div>
  )
})
