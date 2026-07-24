import { observer } from 'mobx-react-lite'
import ButtonClose from '@/widgets/Task/TaskRow/ui/Buttons/ButtonClose'
import { ButtonTimer } from '@/widgets/Task/TaskRow/ui/Buttons/ButtonTimer'
import { usePermissionTask } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

export const ActionButtonsDrawer = observer(() => {
  const {
    taskStore: { activeTask }
  } = useRootStore()

  const { canTrackTask, canExecuteTask } = usePermissionTask(activeTask)

  return (
    <div className={'flex gap-2 p-4 border-b border-b-hover h-[79px]'}>
      {canTrackTask && (
        <ButtonTimer className={'w-full body-16'} task={activeTask} />
      )}
      {canExecuteTask && (
        <ButtonClose className={'w-full body-16'} task={activeTask} />
      )}
    </div>
  )
})
